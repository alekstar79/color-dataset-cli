import { CommandContext, ColorData, RecalcResult, RecalcStats } from '@/types'

import { ColorMetrics } from '@/utils/ColorMetrics'
import { ProgressBar } from '@/utils/ProgressBar'
import { Command } from '@/core/Command'

export class RecalcCommand extends Command {
  constructor() {
    super(
      'recalc',
      '<dataset> [output]',
      'Пересчёт rgb/hsl/hueRange из hex',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'dataset', required: true, type: 'path'   },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      }
    )

    this.option('-o, --output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--denormalize, -d', 'Denormalize')
      .option('--family, -f', 'Forced redefinition of the family')
      .validate(({ args }) => !args[0]
        ? '❌ Specify path to the dataset: recalc <dataset> <output>'
        : true
      )
      .validate(({ args, options }) => !(options.output || options.o || args[1])
        ? '❌ Specify path to save: recalc <dataset> <output>'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger, app }: CommandContext
  ): Promise<RecalcResult> {
    logger.info('🔄 Recalculating all color values from HEX...')

    const colors = datasets[args[0]]
    const useDenormalize = options.denormalize || options.d
    const forceFamily = options.family || options.f

    const result = this.recalculateFromHex(colors, forceFamily, logger)
    logger.success('✅ Recalculation completed')
    this.printStats(result.stats, logger)

    let finalData = result.data

    if (useDenormalize) {
      logger.info('🔗 Denormalization...')

      const normalizeCommand = app.commands.get('normalize') as any
      if (!normalizeCommand?.processNormalization) {
        throw new Error('❌ The processNormalization method was not found')
      }

      const denormResult = normalizeCommand.processNormalization(
        result.data, 'denormalize', 'all', logger
      )

      finalData = denormResult.data
      logger.success('✅ Denormalization is complete')
    }

    return { stats: result.stats, data: finalData }
  }

  recalculateFromHex(
    data: ColorData[],
    forceFamily: boolean,
    _logger: any
  ): { stats: RecalcStats; data: ColorData[] } {
    const progress = new ProgressBar({ total: data.length, width: 40 })
    const stats: RecalcStats = { total: data.length, recalculated: { rgb: 0, hsl: 0, hueRange: 0 }, errors: 0 }

    const processed = data.map(color => {
      try {
        const rgb = ColorMetrics.hexToRgb(color.hex)
        const metrics = ColorMetrics.hexToHslMetrics(color.hex)
        const hsl = {
          h: metrics.h,
          s: metrics.s,
          l: metrics.l
        }

        const family = forceFamily
          ? ColorMetrics.getColorFamily(hsl)
          : color.family ?? ColorMetrics.getColorFamily(hsl)

        const processed: ColorData = {
          ...color,
          family,
          hueRange: metrics.hueRange,
          hsl,
          rgb
        }

        stats.recalculated.rgb++
        stats.recalculated.hsl++
        stats.recalculated.hueRange++

        progress.update(1)
        return processed
      } catch (error) {
        progress.update(1)
        stats.errors++
        return color
      }
    })

    progress.processing()

    return { stats, data: processed }
  }

  private printStats(stats: RecalcStats, logger: any) {
    logger.info('📊 RECALCULATION STATISTICS:')
    logger.info(`  Total: ${stats.total}`)
    logger.info(`  ✅ RGB: ${stats.recalculated.rgb}`)
    logger.info(`  ✅ HSL: ${stats.recalculated.hsl}`)
    logger.info(`  ✅ HueRange: ${stats.recalculated.hueRange}`)
    logger.info(`  ❌ Errors: ${stats.errors}`)
  }
}
