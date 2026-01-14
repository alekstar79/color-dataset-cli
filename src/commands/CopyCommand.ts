import { ColorData, CommandContext, CopyResult, CopyStats } from '@/types'
import { ProgressBar } from '../utils/ProgressBar'
import { Command } from '../core/Command'

import { CapitalizeCommand } from './CapitalizeCommand'
import { NormalizeNameCommand } from './NormalizeNameCommand'

export class CopyCommand extends Command {
  constructor() {
    super(
      'copy',
      '<input> <output>',
      'Copying a dataset with format conversion',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'input', required: true, type: 'path'     },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      }
    )

    this.option('-o', '--output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts)', 'ts')
      .option('--no-smart', 'Without processing')
      .option('--capitalize-only', 'Only capitalize')
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { app, args, options, logger }: CommandContext
  ): Promise<CopyResult> {

    const colors = datasets[args[0]]
    const doSmart = !options.noSmart
    const onlyCapitalize = options['capitalize-only']

    logger.info('📋 Copying a dataset...')
    logger.info(`📊 Colors: ${colors.length}`)

    let result = this.copyDataset(colors)

    if (doSmart) {
      logger.info('🔆 Smart Capitalize...')

      const capitalizeCmd = app.commands.get('capitalize') as CapitalizeCommand

      if (capitalizeCmd?.processColors) {
        const capResult = capitalizeCmd.processColors(result.data, { smart: true })

        result.data = capResult.data
        logger.success(`✅ Capitalize: ${capResult.capitalized}/${capResult.original}`)
      }
    }

    if (doSmart && !onlyCapitalize) {
      logger.info('🧹 Normalize Names...')

      const normalizeCmd = app.commands.get('normalize-name') as NormalizeNameCommand

      if (normalizeCmd?.processColors) {
        const normResult = normalizeCmd.processColors(result.data, app, { smart: true })
        result.data = normResult.data
        logger.success(`✅ Normalize: ${normResult.nameStats.changed} changed`)
      }
    }

    this.printStats(result.stats, logger)

    return result
  }

  private copyDataset(colors: ColorData[]): { stats: CopyStats; data: ColorData[] } {
    const progress = new ProgressBar({ total: colors.length, width: 40 })
    const stats: CopyStats = { total: colors.length, copied: 0, errors: 0 }

    const copied = colors.map(color => {
      try {
        stats.copied++
        progress.update(1)
        return { ...color }
      } catch {
        stats.errors++
        progress.update(1)
        return color
      }
    })

    progress.processing()

    return { stats, data: copied }
  }

  private printStats(stats: any, logger: any) {
    logger.info('\n📊 STATISTICS:')
    logger.info(`  ✅ Copied: ${stats.copied}/${stats.total}`)
    logger.info(`  ❌ Errors: ${stats.errors || 0}`)
  }
}
