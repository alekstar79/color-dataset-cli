// Old Logic
// import { colorDescriptors, colorKernels, colorModifiers, knownCompounds } from '@/utils/words'
// import { ColorData, CommandContext, NameAnalysis, NameNormalizeStats } from '@/types'
//
// import { ColorMetrics } from '../utils/ColorMetrics'
// import { ProgressBar } from '../utils/ProgressBar'
//
// import { Application } from '../core/Application'
// import { Command } from '../core/Command'
// import { Logger } from '../utils/Logger'
//
// import { CapitalizeCommand } from './CapitalizeCommand'
//
// const getEmptyNameAnalysis = (name: any): NameAnalysis => ({
//   isClean: false,
//   isChanged: true,
//   original: name,
//   normalized: 'Unknown',
//   wordCount: 0,
//   finalName: 'Unknown',
//   tokens: [],
//   baseTokens: [],
//   modifiers: [],
//   descriptors: [],
//   descriptorsRemoved: 0,
//   hasCamelCase: false,
//   confidence: 0
// })
//
// export class NormalizeNameCommand extends Command {
//   private readonly colorKernels: Set<string>
//   private readonly knownCompounds: Set<string>
//   private readonly colorModifiers: Set<string>
//   private readonly colorDescriptors: Set<string>
//
//   constructor() {
//     super(
//       'normalize-name',
//       '<dataset> [output]',
//       'Нормализация названий цветов: TitleCase, 1-2 слова, семантическая очистка',
//       (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
//         this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
//         allowUnknownOptions: false,
//         strict: true,
//         schema: {
//           args: [
//             { name: 'dataset', required: true, type: 'path'   },
//             { name: 'output', required: false, type: 'output' }
//           ]
//         }
//       }
//     )
//
//     // Инициализация словарей из colorKernels
//     this.colorKernels = this.buildKernelColors()
//
//     this.knownCompounds = new Set(knownCompounds.map(c => c.toLowerCase()))
//
//     this.colorModifiers = new Set<string>()
//     Object.values(colorModifiers).forEach(category => {
//       category.forEach(modifier => this.colorModifiers.add(modifier.toLowerCase()))
//     })
//
//     this.colorDescriptors = new Set<string>()
//     Object.values(colorDescriptors).forEach(category => {
//       category.forEach(desc => this.colorDescriptors.add(desc.toLowerCase()))
//     })
//
//     this.option('-o, --output <path>', 'Сохранить результат')
//       .option('--format <format>', 'Формат (json|ts)', 'ts')
//       .option('--report', 'Подробный отчёт')
//       .option('--dry-run', 'Только анализ без изменений')
//       .validate(({ args }) => !args[0]
//         ? '❌ Укажите путь к датасету: normalize-name <dataset> [output]'
//         : true
//       )
//   }
//
//   async perform(
//     datasets: Record<string, ColorData[]>,
//     _metadata: Record<string, any>,
//     { app, args, options, logger, dataset }: CommandContext
//   ): Promise<{ data: ColorData[], nameStats: NameNormalizeStats }> {
//     const datasetPath = args[0]
//     const colors = datasets[datasetPath]
//     const outputPath = options.output || options.o || args[1]
//     const dryRun = options.dryRun
//     const showReport = options.report
//     const format = options.format || 'ts'
//
//     logger.info('🧹 Нормализация названий цветов...')
//     logger.info(`📊 Цветов: ${colors.length}`)
//
//     const result = this.normalizeNames(colors, app)
//
//     logger.success(`✅ Нормализовано: ${result.nameStats.changed}/${colors.length} названий`)
//     this.printNameStats(result.nameStats, logger)
//
//     if (showReport) {
//       this.printNameReport(result, logger)
//     }
//
//     if (!dryRun && outputPath) {
//       await dataset.save(result.data, outputPath, format, logger)
//     }
//
//     return { data: result.data, nameStats: result.nameStats }
//   }
//
//   private normalizeNames(colors: ColorData[], app: Application): {
//     nameStats: NameNormalizeStats
//     data: ColorData[]
//   } {
//     const command = app.commands.get('capitalize') as CapitalizeCommand
//     if (!command.capitalizeNames) {
//       throw new Error('❌ Команда "capitalize" не найдена или метод deduplicate отсутствует')
//     }
//
//     const progress = new ProgressBar({ total: colors.length, width: 40 })
//     const normalized: ColorData[] = []
//     const usedNames = new Map<string, number>()
//     const stats: NameNormalizeStats = {
//       total: colors.length,
//       changed: 0,
//       clean: 0,
//       tooLong: 0,
//       camelCase: 0,
//       descriptorsRemoved: 0,
//       duplicateConflicts: 0,
//       repeatedWordsRemoved: 0,
//       fallbackUsed: 0
//     }
//
//     for (const color of colors) {
//       const originalName = color.name
//
//       let analysis = this.analyzeName(originalName)
//       let baseName = this.generateNormalizedName(color, analysis)
//
//       // ANTI-DUPLICATE с fallback на оригинал
//       let finalName = this.resolveUniqueName(baseName, color, usedNames, stats, originalName)
//
//       const lowerName = finalName.toLowerCase()
//       if (usedNames.has(lowerName)) {
//         stats.duplicateConflicts++
//         finalName = command.capitalize(originalName)
//       }
//
//       usedNames.set(lowerName, (usedNames.get(lowerName) || 0) + 1)
//
//       const finalAnalysis = this.analyzeName(finalName)
//       const normalizedColor = {
//         ...color,
//         name: finalName,
//         nameOriginal: originalName,
//         nameNormalized: finalName !== command.capitalize(originalName),
//         nameAnalysis: finalAnalysis
//       } as ColorData
//
//       normalized.push(normalizedColor)
//
//       if (finalName === command.capitalize(originalName)) {
//         stats.fallbackUsed++
//       }
//       if (this.hasRepeatedWords(finalName)) {
//         stats.repeatedWordsRemoved++
//       }
//
//       if (finalAnalysis.isChanged) stats.changed++
//       if (analysis.isClean) stats.clean++
//       if (analysis.wordCount > 2) stats.tooLong++
//       if (analysis.hasCamelCase) stats.camelCase++
//
//       stats.descriptorsRemoved += analysis.descriptorsRemoved
//
//       progress.update(1)
//     }
//
//     progress.processing()
//
//     return { data: normalized, nameStats: stats }
//   }
//
//   private analyzeName(name: any): NameAnalysis {
//     if (!name || typeof name !== 'string') {
//       return getEmptyNameAnalysis(name)
//     }
//
//     // 1. CamelCase → spaces + lowercase
//     let processed = name
//       .replace(/([A-Z])/g, ' $1')
//       .trim()
//       .toLowerCase()
//
//     // 2. Разделение compound слов
//     processed = this.splitCompounds(processed)
//
//     // 3. Токенизация
//     const tokens = processed
//       .split(/\s+/)
//       .map(t => t.trim())
//       .filter(t => t.length > 1)
//
//     // 4. Классификация
//     const baseTokens = tokens.slice(0, 2)
//     const modifiers = tokens.slice(2).filter(t => this.colorModifiers.has(t))
//     const descriptors = tokens.slice(2).filter(t => this.colorDescriptors.has(t))
//
//     // 5. Базовое имя (макс 2 слова)
//     const baseNameWords = baseTokens
//     const baseName = baseNameWords.join(' ')
//     const isClean = baseNameWords.length <= 2 && baseNameWords.length > 0
//     const isChanged = baseName !== processed || name !== baseName
//
//     return {
//       isClean,
//       isChanged,
//       original: name,
//       normalized: processed,
//       finalName: baseName,
//       tokens,
//       baseTokens,
//       modifiers,
//       descriptors,
//       descriptorsRemoved: descriptors.length,
//       wordCount: tokens.length,
//       hasCamelCase: name !== name.toLowerCase().replace(/\s/g, ''),
//       confidence: baseTokens.length / Math.max(1, tokens.length)
//     }
//   }
//
//   private generateNormalizedName(_color: ColorData, analysis: NameAnalysis): string {
//     const baseWords = analysis.baseTokens.slice(0, 2)
//
//     if (baseWords.length === 0) return 'Unknown'
//
//     return baseWords.join(' ')
//   }
//
//   private resolveUniqueName(
//     baseName: string,
//     color: ColorData,
//     usedNames: Map<string, number>,
//     stats: NameNormalizeStats,
//     originalName: string
//   ): string {
//     let candidate = this.generateCleanName(baseName)
//     let attempts = 0
//
//     while ((usedNames.has(candidate) || this.hasRepeatedWords(candidate)) && attempts < 3) {
//       stats.duplicateConflicts++
//
//       if (attempts === 0) {
//         const cleanFamily = (color.family || '').replace(/-/g, ' ').trim()
//         candidate = this.generateCleanName(`${cleanFamily} ${baseName}`)
//       } else if (attempts === 1 && color.hsl) {
//         const hueDesc = this.getHueDescriptor(color.hsl.h)
//         candidate = this.generateCleanName(`${hueDesc} ${baseName}`)
//       } else if (attempts === 2 && color.hsl) {
//         const lightDesc = ColorMetrics.getLightness(color.hsl)
//         candidate = this.generateCleanName(`${lightDesc} ${baseName}`)
//       } else {
//         return originalName
//       }
//
//       attempts++
//     }
//
//     usedNames.set(candidate, (usedNames.get(candidate) || 0) + 1)
//
//     return candidate
//   }
//
//   private generateCleanName(name: string): string {
//     // 1. Убираем дефисы → пробелы
//     let clean = name.replace(/-/g, ' ').trim()
//
//     // 3. Удаляем повторы подряд
//     clean = clean.replace(/\b(\w+)\s+\1\b/gi, '$1')
//
//     // 4. Убираем избыточные базовые цвета
//     return this.removeRedundantBaseColors(clean)
//   }
//
//   private hasRepeatedWords(name: string): boolean {
//     const words = name.toLowerCase().split(/\s+/)
//     const uniqueWords = new Set(words)
//
//     return words.length !== uniqueWords.size
//   }
//
//   private removeRedundantBaseColors(name: string): string {
//     const words = name.toLowerCase().split(/\s+/)
//     const baseColors = Array.from(this.colorKernels)
//
//     // Если есть повторяющиеся базовые цвета → оставляем последний
//     const filteredWords = words.filter((word, index, arr) => {
//       if (!baseColors.includes(word)) return true
//
//       return arr.filter(w => baseColors.includes(w)).length > 1
//         ? arr.slice(index).filter(w => baseColors.includes(w)).indexOf(word) === 0
//         : true
//     })
//
//     return filteredWords.join(' ')
//   }
//
//   private getHueDescriptor(hue: number): string {
//     hue = (hue % 360 + 360) % 360
//
//     const descriptors = ['Vivid', 'Deep', 'Warm', 'Cool', 'Bright', 'Pure']
//
//     if (hue <= 15 || hue >= 345) return 'Vivid'
//     if (hue < 45) return 'Warm'
//     if (hue < 75) return 'Sunny'
//     if (hue < 135) return 'Fresh'
//     if (hue < 195) return 'Cool'
//     if (hue < 255) return 'Deep'
//     if (hue < 315) return 'Rich'
//
//     return descriptors[Math.floor(hue / 60) % descriptors.length]
//   }
//
//   private splitCompounds(text: string): string {
//     let result = text
//
//     // Известные compound цвета
//     for (const compound of this.knownCompounds) {
//       const regex = new RegExp(`\\b${compound}\\b`, 'gi')
//       result = result.replace(regex, compound)
//     }
//
//     return result.replace(/\s+/g, ' ').trim()
//   }
//
//   private printNameStats(stats: NameNormalizeStats, logger: any) {
//     logger.info('\n📊 СТАТИСТИКА НОРМАЛИЗАЦИИ НАЗВАНИЙ:')
//     logger.info(`Всего:             ${stats.total}`)
//     logger.info(`Изменено:          ${stats.changed} (${((stats.changed/stats.total)*100).toFixed(1)}%)`)
//     logger.info(`Были чистыми:      ${stats.clean}`)
//     logger.info(`>2 слов:           ${stats.tooLong}`)
//     logger.info(`CamelCase:         ${stats.camelCase}`)
//     logger.info(`Дескрипторов:      ${stats.descriptorsRemoved}`)
//     logger.info(`Конфликтов дублей: ${stats.duplicateConflicts}`)
//     logger.info(`Fallback оригинал: ${stats.fallbackUsed}`)
//   }
//
//   private printNameReport(
//     result: { data: ColorData[], nameStats: NameNormalizeStats },
//     logger: Logger
//   ) {
//     const examples = result.data
//       .map(c => c.nameAnalysis!)
//       .filter(a => a.isChanged)
//       .slice(0, 10)
//       .map(a => ({
//         before: a.original,
//         after: a.finalName,
//         words: a.wordCount,
//         confidence: a.confidence.toFixed(2)
//       }))
//
//     logger.info('\n📋 ПРИМЕРЫ НОРМАЛИЗАЦИИ:')
//     examples.forEach((ex, i) => {
//       logger.info(`  ${i+1}. "${ex.before}" → "${ex.after}" (${ex.words}→2, ${ex.confidence})`)
//     })
//   }
//
//   private buildKernelColors(): Set<string> {
//     const bases = new Set<string>()
//
//     Object.values(colorKernels).forEach(family => {
//       family.forEach(word => {
//         const original = word.trim()
//         const clean = original.toLowerCase().replace(/\s+/g, ' ')
//
//         bases.add(original.toLowerCase())
//         bases.add(clean)
//       })
//     })
//
//     return bases
//   }
// }

// New Logic
import { colorKernels, colorModifiers, colorDescriptors, knownCompounds } from '@/utils/words'
import { ColorData, CommandContext, NameAnalysis, NameNormalizeStats } from '@/types'

import { ProgressBar } from '../utils/ProgressBar'
import { Application } from '../core/Application'
import { Command } from '../core/Command'

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
      'Нормализация названий: TitleCase + 1-2 слова',
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

    this.option('-o', '--output <path>', 'Сохранить результат')
      .option('--format <format>', 'Формат (json|ts)', 'ts')
      .option('--report', 'Подробный отчёт')
      .option('--dry-run', 'Только анализ')
      .option('--smart', 'Smart capitalize', true)
      .option('--no-smart', 'Отключить smart capitalize')
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { app, args, options, logger }: CommandContext
  ) {
    const colors = datasets[args[0]!]
    const useSmart = options.smart !== false && !options.noSmart

    logger.info(`🧹 Нормализация названий... Smart: ${useSmart ? 'ВКЛ' : 'ВЫКЛ'}`)
    logger.info(`📊 Цветов: ${colors.length}`)

    const result = this.processColors(colors, app, { smart: useSmart })
    logger.success(`✅ Нормализовано: ${result.nameStats.changed}/${colors.length}`)

    this.printNameStats(result.nameStats, logger)

    return {
      data: result.data,
      nameStats: result.nameStats
    }
  }

  public processColors(colors: ColorData[], app: Application, options: { smart: boolean }) {
    const capitalizeCmd = app.commands.get('capitalize') as CapitalizeCommand

    if (!capitalizeCmd?.capitalize) throw new Error('CapitalizeCommand не найдена')

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

    // kernels для улучшения confidence
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
    logger.info('\n📊 СТАТИСТИКА:')
    logger.info(`  Изменено: ${stats.changed} (${((stats.changed/stats.total)*100).toFixed(1)}%)`)
    logger.info(`  Чистых: ${stats.clean}, >3 слов: ${stats.tooLong}`)
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
