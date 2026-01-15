import { colorKernels, colorModifiers, colorDescriptors, knownCompounds } from '@/utils/words'
import { ColorData, CommandContext, NameAnalysis, NameNormalizeStats } from '@/types'

import { ProgressBar } from '@/utils/ProgressBar'
import { Application } from '@/core/Application'
import { Command } from '@/core/Command'

import { CapitalizeCommand } from './CapitalizeCommand'

const getEmptyNameAnalysis = (name: any): NameAnalysis => ({
  isClean: false,
  isChanged: true,
  original: name,
  normalized: 'Unknown',
  wordCount: 0,
  finalName: 'Unknown',
  tokens: [],
  baseTokens: [],
  modifiers: [],
  descriptors: [],
  descriptorsRemoved: 0,
  hasCamelCase: false,
  confidence: 0
})

export class NormalizeNameCommand extends Command {
  private readonly colorKernels: Set<string>
  private readonly knownCompounds: Set<string>
  private readonly colorModifiers: Set<string>
  private readonly colorDescriptors: Set<string>

  constructor() {
    super(
      'normalize-name',
      '<dataset> [output]',
      'Normalization of names: TitleCase + 1-2 words',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false, strict: true,
        schema: {
          args: [
            { name: 'dataset', required: true, type: 'path'   },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      })

    this.colorKernels = this.buildKernelColors()
    this.knownCompounds = new Set(knownCompounds.map(c => c.toLowerCase()))

    this.colorModifiers = new Set()
    Object.values(colorModifiers)
      .forEach(category => category.forEach(m => {
        this.colorModifiers.add(m.toLowerCase())
      }))

    this.colorDescriptors = new Set()
    Object.values(colorDescriptors)
      .forEach(category => category.forEach(d => {
        this.colorDescriptors.add(d.toLowerCase())
      }))

    this.option('-o', '--output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--report', 'Detailed report')
      .option('--dry-run', 'Analysis only')
      .option('--smart', 'Smart capitalize', true)
      .option('--no-smart', 'Disable smart capitalize')
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { app, args, options, logger }: CommandContext
  ) {
    const colors = datasets[args[0]!]
    const useSmart = options.smart !== false && !options.noSmart

    logger.info(`🧹 Normalization of names... Smart: ${useSmart ? 'ON' : 'OFF'}`)
    logger.info(`📊 Colors: ${colors.length}`)

    const result = this.processColors(colors, app, { smart: useSmart })
    logger.success(`✅ Normalized: ${result.nameStats.changed}/${colors.length}`)

    this.printNameStats(result.nameStats, logger)

    return {
      data: result.data,
      nameStats: result.nameStats
    }
  }

  public processColors(colors: ColorData[], app: Application, options: { smart: boolean }) {
    const capitalizeCmd = app.commands.get('capitalize') as CapitalizeCommand

    if (!capitalizeCmd?.capitalize) throw new Error('CapitalizeCommand not found')

    const progress = new ProgressBar({ total: colors.length, width: 40 })
    const usedNames = new Map<string, number>()
    const stats: NameNormalizeStats = {
      total: colors.length,
      changed: 0,
      clean: 0,
      tooLong: 0,
      camelCase: 0,
      descriptorsRemoved: 0,
      duplicateConflicts: 0,
      repeatedWordsRemoved: 0,
      fallbackUsed: 0
    }

    const normalized: ColorData[] = []

    for (const color of colors) {
      const originalName = color.name

      let analysis = this.analyzeName(originalName)
      let baseName = this.generateNormalizedName(color, analysis, capitalizeCmd, options)
      let finalName = this.resolveUniqueName(baseName, color, usedNames, stats, originalName, capitalizeCmd, options)

      const lowerName = finalName.toLowerCase()

      if (usedNames.has(lowerName)) {
        stats.duplicateConflicts++
        finalName = capitalizeCmd.capitalize(originalName)
      }

      usedNames.set(lowerName, (usedNames.get(lowerName) || 0) + 1)

      const finalAnalysis = this.analyzeName(finalName)
      const normalizedColor: ColorData = {
        ...color,
        name: finalName,
        nameOriginal: originalName,
        nameNormalized: finalName !== capitalizeCmd.capitalize(originalName),
        nameAnalysis: finalAnalysis
      }

      normalized.push(normalizedColor)

      if (finalName === capitalizeCmd.capitalize(originalName)) stats.fallbackUsed++
      if (this.hasRepeatedWords(finalName)) stats.repeatedWordsRemoved++
      if (finalAnalysis.isChanged) stats.changed++
      if (analysis.isClean) stats.clean++
      if (analysis.wordCount > 3) stats.tooLong++
      if (analysis.hasCamelCase) stats.camelCase++

      stats.descriptorsRemoved += analysis.descriptorsRemoved

      progress.update(1)
    }

    progress.processing()
    return { data: normalized, nameStats: stats }
  }

  private analyzeName(name: any): NameAnalysis {
    if (!name || typeof name !== 'string') return getEmptyNameAnalysis(name)

    let processed = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
    processed = this.splitCompounds(processed)

    const tokens = processed.split(/\s+/).map(t => t.trim()).filter(t => t.length > 1)
    const baseTokens = tokens.slice(0, 3)
    const baseName = baseTokens.join(' ')

    const modifiers = tokens.filter(t => this.colorModifiers.has(t))
    const descriptors = tokens.filter(t => this.colorDescriptors.has(t))

    const kernels = tokens.filter(t => this.colorKernels.has(t))
    const kernelCount = kernels.length

    // kernels to improve confidence
    const hasKernel = kernelCount > 0
    const kernelConfidence = hasKernel ? 1.2 : 0.8

    return {
      isClean: baseTokens.length <= 3 && baseTokens.length > 0,
      isChanged: baseName !== processed || name !== baseName,
      original: name,
      normalized: processed,
      finalName: baseName,
      tokens,
      baseTokens,
      modifiers,
      descriptors,
      descriptorsRemoved: descriptors.length,
      wordCount: tokens.length,
      hasCamelCase: name !== name.toLowerCase().replace(/\s/g, ''),
      confidence: (baseTokens.length / Math.max(1, tokens.length)) * kernelConfidence
    }
  }

  private generateNormalizedName(color: ColorData, analysis: NameAnalysis, capitalizeCmd: CapitalizeCommand, options: { smart: boolean }): string {
    let baseName = analysis.baseTokens.slice(0, 3).join(' ')

    if (analysis.confidence < 0.5 && color.family) {
      baseName = `${color.family} ${baseName}`.trim()
    }

    return capitalizeCmd.smartCapitalize(baseName, options).name
  }

  private resolveUniqueName(
    baseName: string,
    color: ColorData,
    usedNames: Map<string, number>,
    stats: NameNormalizeStats,
    originalName: string,
    capitalizeCmd: CapitalizeCommand,
    _options: { smart: boolean }
  ): string {
    let candidate = this.generateCleanName(baseName)
    let attempts = 0

    while (
      (usedNames.has(candidate.toLowerCase()) || this.hasRepeatedWords(candidate)) &&
      attempts < 3
      ) {
      stats.duplicateConflicts++

      if (attempts === 0 && color.family) {
        candidate = capitalizeCmd.capitalize(`${color.family} ${baseName}`)
      } else if (attempts === 1 && color.hsl) {
        candidate = capitalizeCmd.capitalize(`${this.getHueDescriptor(color.hsl.h)} ${baseName}`)
      } else {
        return capitalizeCmd.capitalize(originalName)
      }

      attempts++
    }

    return candidate
  }

  private generateCleanName(name: string): string {
    return name.replace(/-/g, ' ').trim().replace(/\b(\w+)\s+\1\b/gi, '$1')
  }

  private hasRepeatedWords(name: string): boolean {
    const words = name.toLowerCase().split(/\s+/)
    return words.length !== new Set(words).size
  }

  private getHueDescriptor(hue: number): string {
    hue = (hue % 360 + 360) % 360
    return hue < 30 ? 'Vivid' : hue < 60 ? 'Warm' : hue < 120 ? 'Bright' : 'Cool'
  }

  private splitCompounds(text: string): string {
    return this.knownCompounds.has(text.toLowerCase()) ? text : text.replace(/\s+/g, ' ').trim()
  }

  private printNameStats(stats: NameNormalizeStats, logger: any) {
    logger.info('\n📊 STATISTICS:')
    logger.info(`  Changed: ${stats.changed} (${((stats.changed/stats.total)*100).toFixed(1)}%)`)
    logger.info(`  Clean: ${stats.clean}, >3 words: ${stats.tooLong}`)
  }

  private buildKernelColors(): Set<string> {
    const bases = new Set<string>()

    Object.values(colorKernels).forEach(family => {
      family.forEach(word => {
        bases.add(word.trim().toLowerCase())
        bases.add(word.toLowerCase().replace(/\s+/g, ' '))
      })
    })

    return bases
  }
}
