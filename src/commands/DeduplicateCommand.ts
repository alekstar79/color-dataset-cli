import { CommandContext, ColorData, DeduplicateResult, DeduplicateStats } from '@/types'

import { SemanticDeduplicator } from '@/utils/deduplicator/SemanticDeduplicator'
import { Command } from '@/core/Command'
import { Logger } from '@/utils/Logger'

import { writeFile } from 'fs/promises'

export class DeduplicateCommand extends Command {
  private deduplicator: SemanticDeduplicator

  constructor() {
    super(
      'deduplicate',
      '<dataset> [output]',
      'Deduplicate color dataset by HEX and name (exact match)',
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

    this.deduplicator = new SemanticDeduplicator()

    this.option('-o, --output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--report', 'Show a detailed report')
      .option('--save-report <path>', 'Save the report')
      .validate(({ args }) => !args[0]
        ? '❌ Specify path to the dataset: deduplicate <dataset> <output>'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<DeduplicateResult> {
    logger.info('🔬 Semantic dataset deduplication...')

    const colors = datasets[args[0]]
    const showReport = options.report

    logger.info(`📊 Original colors: ${colors.length}`)

    const result = this.deduplicate(colors)

    logger.success(`✅ Deduplication is complete: ${result.stats.removed} deleted`)
    this.printStats(result.stats, logger)

    if (showReport) {
      this.printDetailedReport(result, logger)
    }
    if (options.saveReport) {
      await this.saveReport(result, options.saveReport, logger)
    }

    return result
  }

  deduplicate(colors: ColorData[]): DeduplicateResult {
    const result = this.deduplicator.deduplicate(colors)
    const stats: DeduplicateStats = {
      original: colors.length,
      unique: result.colors.length,
      removed: colors.length - result.colors.length,
      removalRate: ((colors.length - result.colors.length) / colors.length * 100).toFixed(1)
    }

    return {
      data: result.colors,
      duplicates: result.stats,
      stats
    }
  }

  printStats(stats: DeduplicateStats, logger: any) {
    logger.info('\n📊 DEDUPLICATION STATISTICS:')
    logger.info(`Original:  ${stats.original}`)
    logger.info(`Unique:    ${stats.unique}`)
    logger.info(`Deleted:   ${stats.removed}`)
    logger.info(`Percent:   ${stats.removalRate}%`)
  }

  printDetailedReport(result: DeduplicateResult, logger: any) {
    logger.info('\n📈 DETAILED REPORT:')

    for (const dup of result.duplicates.slice(0, 10)) {
      logger.info(`  ${dup.hex}: ${dup.names.join(' → ')} → ${dup.selected} (${dup.reason})`)
    }
    if (result.duplicates.length > 10) {
      logger.info(`  ... and ${result.duplicates.length - 10} more groups`)
    }
  }

  private async saveReport(
    result: DeduplicateResult,
    path: string,
    logger: Logger
  ) {
    const report = this.deduplicator.generateReport(result.data)
    await writeFile(path, JSON.stringify(report, null, 2), 'utf-8')
    logger.success(`📄 Report is saved: ${path}`)
  }
}
