import { ColorData, CommandContext, GenerateResult, GenerateStats } from '@/types'

import { FamilyCoverageAnalyzer } from '@/utils/dataset-distribution/FamilyCoverageAnalyzer'
import { DatasetDistribution } from '@/utils/dataset-distribution/DatasetDistribution'
import { DatasetBalancer } from '@/utils/dataset-distribution/DatasetBalancer'

import { Command } from '@/core/Command'
import { Logger } from '@/utils/Logger'

export class SmartGenerateCommand extends Command {
  private analyzer: FamilyCoverageAnalyzer

  constructor() {
    super(
      'smart-generate',
      '<output> <count>',
      'Generation of an intelligent dataset with optimal coverage of families',
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

    this.analyzer = new FamilyCoverageAnalyzer()

    this.option('-o', '--output <path>', 'Save the result')
      .option('-f, --format <format>', 'Format (json|ts|minify)', 'ts')
      .option('--phases <value>', 'Number of generation phases (1-5)', '3')
      .option('--tolerance <value>', 'Balancing tolerance % (10-50)', '30')
      .validate(({ args, options }) => !(options.output || options.o || args[0])
        ? '❌ Specify path to save: smart-generate <dataset> <output>'
        : true
      )
  }

  async perform(
    _datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<GenerateResult> {
    const count = parseInt(args[1] ?? 1200)
    const tolerance = parseInt(options.tolerance) || 30

    logger.info('🧠 Generation of an intelligent dataset...')
    logger.info(`📊 Colors: ${count}`)
    logger.info(`🎯 Phases: 3, Balance tolerance: ±${tolerance}%`)

    const result = this.generateDataset(count, tolerance, logger)

    this.printStats(result.stats, logger)

    return result
  }

  generateDataset(
    count: number,
    tolerance: number, // ±30%
    logger: Logger
  ): { data: ColorData[], stats: any } {

    // PHASE 1: Structured Generation
    logger.info('📊 Phase 1: Structured Generation...')
    const distribution = new DatasetDistribution(count)
    const generatedColors = distribution.generateStructuredDataset(logger)

    // PHASE 2: Balancing
    logger.info('⚖️ Phase 2: Balancing the families...')
    const balancer = new DatasetBalancer()
    const balancedColors = balancer.balance(generatedColors, tolerance, logger)

    // PHASE 3: Final check
    logger.info('✅ Phase 3: Final optimization...')

    const finalColors = balancedColors.slice(0, count)

    const { families, coverage, quality } = this.analyzer.validate(finalColors, logger)

    return {
      data: finalColors,
      stats: {
        total: count,
        generated: finalColors.length,
        families: families.size,
        coverage: parseFloat(coverage.toFixed(1)),
        quality: parseFloat(quality.toFixed(1)),
        errors: 0
      }
    }
  }

  private printStats(stats: GenerateStats, logger: Logger) {
    logger.info('\n📊 SMART GENERATION STATISTICS:')
    logger.info(`  ✅ Generated: ${stats.generated}/${stats.total}`)
    logger.info(`  ❌ Errors: ${stats.errors}`)
    logger.info(`  🎨 Families: ${stats.families}/${this.analyzer.TOTAL_FAMILIES}`)
    logger.info(`  🌈 Coverage: ${((stats.families! / this.analyzer.TOTAL_FAMILIES) * 100).toFixed(1)}%`)
  }
}
