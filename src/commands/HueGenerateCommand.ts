import { ColorData, CommandContext, Family, GenerateResult, GenerateStats, Tuple } from '@/types'

import { Command } from '@/core/Command'
import { ColorMetrics } from '@/utils/ColorMetrics'
import { ProgressBar } from '@/utils/ProgressBar'
import { Logger } from '@/utils/Logger'

export class HueGenerateCommand extends Command {
  families: Set<Family> = new Set()

  constructor() {
    super(
      'hue-generate',
      '<output> <count>',
      'Generating a uniform color dataset based on the color spectrum',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'output', required: true, type: 'output' },
            { name: 'count', required: false, type: 'number' }
          ]
        }
      }
    )

    this.option('-o', '--output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--saturation <value>', 'Saturation (10-100)', '85')
      .option('--lightness <value>', 'Brightness (10-90)', '50')
      .option('--hue-steps <value>', 'Hue step (1-30)', '3')
      .option('--sat-spread <value>', 'Saturation spread (±)', '15')
      .option('--light-spread <value>', 'Brightness spread (±)', '20')
      .validate(({ args, options }) => !(options.output || options.o || args[0])
        ? '❌ Specify path to save: hue-generate <dataset> <output>'
        : true
      )
  }

  async perform(
    _datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<GenerateResult> {

    const count = parseInt(args[1] ?? 1200)
    const saturation = parseInt(options.saturation as string) || 85
    const lightness = parseInt(options.lightness as string) || 50
    const hueSteps = parseInt(options['hue-steps'] as string) || 3
    const satSpread = parseInt(options['sat-spread'] as string) || 15
    const lightSpread = parseInt(options['light-spread'] as string) || 20

    logger.info('🌈 Generating a uniform color dataset...')
    logger.info(`📊 Colors: ${count}`)
    logger.info(`🎚️  S: ${saturation}±${satSpread}, L: ${lightness}±${lightSpread}`)
    logger.info(`🔄 Hue step: ${hueSteps}°`)

    const result = this.generateDataset(count, {
      saturation,
      lightness,
      hueSteps,
      satSpread,
      lightSpread
    }, logger)

    this.printStats(result.stats as GenerateStats, logger)

    logger.success(`✅ Generated: ${result.data.length} colors from ${this.families.size} families`)

    return result
  }

  generateDataset(
    count: number,
    params: {
      saturation: number
      lightness: number
      hueSteps: number
      satSpread: number
      lightSpread: number
    },
    logger: Logger
  ): GenerateResult {
    const { saturation, lightness, satSpread, lightSpread } = params

    const progress = new ProgressBar({ total: count, width: 40 })
    const stats: GenerateStats = { total: count, generated: 0, errors: 0 }
    const colors: ColorData[] = []

    // Hue uniform distribution: 0-360°
    const hueStep = 360 / count
    let currentHue = 0

    for (let i = 0; i < count; i++) {
      try {
        // 1. Uniform hue in a circle
        const h = Math.round((currentHue % 360 + 360) % 360)

        // 2. Saturation with a spread around the base value
        const sVariation = (Math.random() - 0.5) * 2 * (satSpread / 100)
        const s = Math.max(10, Math.min(100, saturation + sVariation * 100))
        const sNorm = Math.round(s)

        // 3. Lightness with a spread (avoiding too dark/light)
        const lVariation = (Math.random() - 0.5) * 2 * (lightSpread / 100)
        const l = Math.max(15, Math.min(85, lightness + lVariation * 100))
        const lNorm = Math.round(l)

        // 4. Generating a color from HSL
        const hex = ColorMetrics.hslToHex({ h, s: sNorm, l: lNorm })

        // 5. Filling in the full ColorData structure
        const rgb = ColorMetrics.hexToRgb(hex)
        const hslMetrics = ColorMetrics.hexToHslMetrics(hex)
        const family = ColorMetrics.getColorFamily({ h, s: sNorm, l: lNorm })

        const color: ColorData = {
          hex,
          name: '',
          family,
          hueRange: hslMetrics.hueRange,
          rgb: rgb as Tuple<number, 3>,
          hsl: {
            h,
            s: sNorm,
            l: lNorm
          }
        }

        this.families.add(family)
        colors.push(color)
        stats.generated++

      } catch (error) {
        stats.errors++
        logger.debug(`Color generation error ${i}: ${error}`)
      }

      progress.update(1)
      currentHue += hueStep
    }

    progress.processing()

    return { data: colors, stats }
  }

  private printStats(stats: GenerateStats, logger: any) {
    logger.info('\n📊 GENERATION STATISTICS:')
    logger.info(`  ✅ Generated: ${stats.generated}/${stats.total}`)
    logger.info(`  ❌ Errors: ${stats.errors}`)
    logger.info(`  🌈 Hue coverage: ${((stats.generated / stats.total) * 360).toFixed(0)}°`)
  }
}
