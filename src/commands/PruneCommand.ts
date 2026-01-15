import { ColorData, CommandContext, GenerateResult } from '@/types'

import { FamilyCoverageAnalyzer } from '@/utils/dataset-distribution/FamilyCoverageAnalyzer'
import { DatasetPruner } from '@/utils/dataset-distribution/DatasetPruner'
import { Command } from '@/core/Command'

export class PruneCommand extends Command {
  constructor() {
    super(
      'prune',
      '<input> <output> <count>',
      'Intelligent dataset pruning with spectral preservation',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'path', required: true, type: 'path'     },
            { name: 'output', required: true, type: 'output' },
            { name: 'count', required: false, type: 'number' },
          ]
        }
      }
    )

    this.option('-o', '--output <path>', 'Save the result')
      .option('-f, --format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--min-families <value>', 'Minimum families to preserve', '20')
      .option('--min-coverage <value>', 'Minimum spectrum coverage % (0-100)', '85')
      .option('--preserve-extremes', 'Preserve extreme hue/saturation/lightness values', true)
      .validate(({ args }) => !args[0] || !args[1]
        ? '❌ Specify: prune <input> <output> <count>'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<GenerateResult> {
    const count = parseInt(args[2] ?? 1200)

    if (!datasets[args[0]]) {
      logger.error(`❌ Dataset "${args[0]}" not found`)
      return { data: [], errors: 1 }
    }

    const inputColors = datasets[args[0]]
    logger.info(`\n🔍 PRUNING DATASET: "${args[0]}"`)
    logger.info(`📊 Input: ${inputColors.length} colors`)

    const pruningConfig = {
      minFamilies: parseInt(options['min-families'] || 20),
      minCoverage: parseInt(options['min-coverage']) / 100 || 0.85,
      preserveExtremes: options['preserve-extremes'] !== false
    }

    const pruner = new DatasetPruner()
    const { data, stats } = pruner.prune(inputColors, count, pruningConfig, logger)

    // Validation of the result
    logger.info('\n✅ Phase 4: Validation...')
    const analyzer = new FamilyCoverageAnalyzer()
    const validation = analyzer.validate(data, logger)

    logger.info('\n📊 PRUNING STATISTICS:')
    logger.info(`  ✂️  Removed: ${stats.removedCount} colors`)
    logger.info(`  ✅ Kept: ${stats.keptCount} colors (${((stats.keptCount / inputColors.length) * 100).toFixed(1)}%)`)
    logger.info(`  📈 Avg quality of kept: ${stats.avgScoreKept.toFixed(1)}/100`)
    logger.info(`  📉 Avg quality of removed: ${stats.avgScoreRemoved.toFixed(1)}/100`)
    logger.info(`  🎯 Quality improvement: +${(stats.avgScoreKept - stats.avgScoreRemoved).toFixed(1)} points`)
    logger.info(`  🎨 Families preserved: ${validation.families.size}/${analyzer.TOTAL_FAMILIES}`)

    return { data, stats }
  }
}
