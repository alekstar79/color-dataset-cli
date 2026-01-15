import { ColorData, CommandContext, NormalizeResult, NormalizeStats, Tuple } from '@/types'
import { ProgressBar } from '@/utils/ProgressBar'
import { Command } from '@/core/Command'

export class NormalizeCommand extends Command {
  constructor() {
    super(
      'normalize',
      '<dataset> [output]',
      'Normalization/denormalization of RGB/HSL values [0-255/360] ↔ [0-1]',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          options: {},
          args: [
            { name: 'dataset', required: true, type: 'path'   },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      }
    )

    this.option('-o, --output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--normalize, -n', 'Normalize → [0-1] (default)')
      .option('--denormalize, -d', 'Denormalize [0-1] → [0-255/360]')
      .option('--rgb', 'RGB properties only')
      .option('--hsl', 'HSL properties only')
      .option('--all', 'All properties (default)')
      .validate(({ args }) => !args[0]
        ? '❌ Specify path to the dataset: normalize <dataset> <output>'
        : true
      )
      .validate(({ args, options }) => !(options.output || options.o || args[1])
        ? '❌ Specify path to save: normalize <dataset> <output>'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, flags, options, logger }: CommandContext
  ): Promise<NormalizeResult> {
    logger.info('🔢 Normalization/denormalization of color values...')

    const colors = datasets[args[0]]
    const mode = options.denormalize || options.d ? 'denormalize' : 'normalize'
    const target = this.getTarget(options, flags)

    logger.info(`📊 Colors: ${colors.length}`)

    const result = this.processNormalization(colors, mode, target)

    logger.success(`✅ ${mode === 'normalize' ? 'Normalization' : 'Denormalization'} completed`)
    this.printStats(result.stats, logger)

    return result
  }

  private getTarget(options: Record<string, any>, flags: string[]): 'rgb' | 'hsl' | 'all' {
    if (options.rgb || flags.includes('rgb')) return 'rgb'
    if (options.hsl || flags.includes('hsl')) return 'hsl'
    return 'all'
  }

  processNormalization(
    data: ColorData[],
    mode: 'normalize' | 'denormalize',
    target: 'rgb' | 'hsl' | 'all',
  ): NormalizeResult {
    const progress = new ProgressBar({ total: data.length, width: 40 })
    const stats: NormalizeStats = {
      rgbProcessed: 0, rgbSkipped: 0,
      hslProcessed: 0, hslSkipped: 0,
      normalized: 0, denormalized: 0,
      totalColors: data.length,
    }

    const processedData = data.map(color => {
      const processed: any = { ...color }

      // RGB
      if ((target === 'rgb' || target === 'all') && processed.rgb !== undefined) {
        try {
          processed.rgb = this.processRGB(processed.rgb, mode)
          stats.rgbProcessed++
        } catch {
          stats.rgbSkipped++
        }
      }

      // HSL
      if ((target === 'hsl' || target === 'all') && processed.hsl !== undefined) {
        try {
          processed.hsl = this.processHSL(processed.hsl, mode)
          stats.hslProcessed++
        } catch {
          stats.hslSkipped++
        }
      }

      progress.update(1)

      return processed
    })

    progress.processing()

    stats[mode === 'normalize' ? 'normalized' : 'denormalized'] = data.length

    return { stats, data: processedData }
  }

  private processRGB(
    rgb: Tuple<number, 3> | { r: number; g: number; b: number },
    mode: 'normalize' | 'denormalize'
  ): Tuple<number, 3> | { r: number; g: number; b: number } {
    let r, g, b

    if (Array.isArray(rgb)) { // Tuple [r,g,b]
      [r, g, b] = rgb
    } else {                  // Object {r,g,b}
      r = rgb.r ?? 0
      g = rgb.g ?? 0
      b = rgb.b ?? 0
    }

    return [
      this.processValue(r, mode, 255),
      this.processValue(g, mode, 255),
      this.processValue(b, mode, 255),
    ]
  }

  private processHSL(
    hsl: { h: number; s: number; l: number },
    mode: 'normalize' | 'denormalize'
  ): { h: number; s: number; l: number } {
    return {
      h: this.processValue(hsl.h, mode, 360),
      s: this.processValue(hsl.s, mode, 1),
      l: this.processValue(hsl.l, mode, 1),
    }
  }

  private processValue(
    value: number,
    mode: 'normalize' | 'denormalize',
    maxFull: number
  ): number {
    if (isNaN(value) || value === undefined) {
      throw new Error('Invalid value')
    }

    if (mode === 'normalize') {
      // Full range → normalize if already normalized [0-1] → do not touch
      const normalized = value > 1 ? value / maxFull : value
      return Number(normalized.toFixed(3))
    } else {
      // Denormalization [0-1] → full range
      if (value <= 1.001) return Math.round(value * maxFull)
      // Already full range → do not touch
      return Math.round(value)
    }
  }

  printStats(stats: NormalizeStats, logger: any) {
    logger.info('\n📊 PROCESSING STATISTICS:')
    logger.info(`Total colors: ${stats.totalColors}`)

    logger.info(`\n🎨 RGB:`)
    logger.info(`  ✅ Processed: ${stats.rgbProcessed}`)
    logger.info(`  ❌ Skipped: ${stats.rgbSkipped}`)

    logger.info(`\n🌈 HSL:`)
    logger.info(`  ✅ Processed: ${stats.hslProcessed}`)
    logger.info(`  ❌ Skipped: ${stats.hslSkipped}`)

    logger.info(`\n🔄 Mode: ${stats.normalized > 0 ? 'Normalization' : 'Denormalization'}`)
  }
}
