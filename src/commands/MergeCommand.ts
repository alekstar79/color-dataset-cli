import { ColorData, CommandContext, DeduplicateResult, MergeDeduplicateResult, MergeResult } from '@/types'

import { Application } from '../core/Application'
import { Command } from '../core/Command'
import { Logger } from '../utils/Logger'

import { DeduplicateCommand } from './DeduplicateCommand'
import { CapitalizeCommand } from './CapitalizeCommand'

export class MergeCommand extends Command {
  constructor() {
    super(
      'merge',
      '<output> [<dataset1> <dataset2> ...]',
      'Merging datasets without duplicates HEX+NAME',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          options: {},
          args: [
            { name: 'output', required: true, type: 'output' }
          ]
        }
      }
    )

    this.option('-f, --format <format>', 'Format (json|ts)', 'ts')
      .option('--capitalize', 'Forceful capitalization (default)')
      .option('--dedupe', 'Forceful deduplication (default)')
      .validate(({ args }) => !args[0]
        ? '❌ Specify path to save: merge <output> <dataset1> <dataset2> ...'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { app, options, logger }: CommandContext
  ): Promise<MergeResult> {
    const capitalize = options.capitalize !== false
    const dedupe = options.dedupe !== false

    logger.info(`🔗 Merging ${Object.keys(datasets).length} datasets`)

    const allColors = Object.values(datasets).flat()

    const result = dedupe
      ? this.deduplicateAll(allColors, app, logger) as unknown as MergeDeduplicateResult
      : { data: allColors, stats: [] }

    result.data = capitalize
      ? this.capitalizeNames(result.data, app, logger)
      : result.data

    logger.success(`✅ Merges completed: ${result.data.length} unique colors`)
    this.printMergeStats(allColors.length, result, logger)

    return {
      data: result.data,
      stats: result.stats,
      inputCount: Object.keys(datasets).length
    }
  }

  private deduplicateAll(
    colors: ColorData[],
    app: Application,
    logger: Logger
  ): DeduplicateResult {
    logger.info('🔬 Deduplication by HEX+NAME...')

    const deduplicateCommand = app.commands.get('deduplicate') as DeduplicateCommand
    if (!deduplicateCommand?.deduplicate) {
      throw new Error('❌ The "deduplicate" command was not found or the "deduplicate" method is missing')
    }

    return deduplicateCommand.deduplicate(colors)
  }

  private capitalizeNames(
    colors: ColorData[],
    app: Application,
    logger: Logger
  ): ColorData[] {
    logger.info('🔬 Capitalize Names...')

    const capitalizeCommand = app.commands.get('capitalize') as CapitalizeCommand
    if (!capitalizeCommand?.processColors) {
      throw new Error('❌ The "capitalize" command was not found or the "processColors" method is missing')
    }

    return capitalizeCommand.processColors(colors).data
  }

  printMergeStats(inputTotal: number, result: any, logger: any) {
    logger.info('\n📊 MERGE STATISTICS:')
    logger.info(`Input:       ${inputTotal} colors`)
    logger.info(`Result:      ${result.data.length} unique`)
    logger.info(`Deleted:     ${inputTotal - result.data.length} duplicates`)
    logger.info(`Efficiency:  ${((result.data.length / inputTotal) * 100).toFixed(1)}%`)

    if (result.stats?.length > 0) {
      logger.info('\n🔍 TOP 5 DUPLICATES:')

      result.stats.slice(0, 5).forEach((dup: any, i: number) => {
        logger.info(`  ${i+1}. ${dup.hex || dup.names?.[0]} → "${dup.selected}" (${dup.reason})`)
      })
    }
  }
}
