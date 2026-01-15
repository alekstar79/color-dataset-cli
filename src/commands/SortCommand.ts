import { ColorData, CommandContext, SortResult, SortStats } from '@/types'

import { Command } from '@/core/Command'
import { ProgressBar } from '@/utils/ProgressBar'
import { Logger } from '@/utils/Logger'

export class SortCommand extends Command {
  private comparisons: number = 0

  constructor() {
    super(
      'sort',
      '<dataset> <output>',
      'Sorting colors by name, hex, or hue (stable O(n log n))',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          options: {},
          args: [
            { name: 'dataset', required: true, type: 'path'  },
            { name: 'output', required: true, type: 'output' }
          ]
        }
      }
    )

    this.option('-o, --output <path>', 'Save the result')
      .option('--format <format>', 'Format (json|ts)', 'ts')
      .option('--by <field>', 'Sorting field: name|hex|hue', 'hex')
      .option('--reverse, -r', 'Reverse order')
      .option('--stable', 'Stable sorting (default)')
      .validate(({ args }) => !args[0]
        ? '❌ Specify path to the dataset: sort <dataset> <output>'
        : true
      )
      .validate(({ args, options }) => !(options.output || options.o || args[1])
        ? '❌ Specify path to save: sort <dataset> <output>'
        : true
      )
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<SortResult> {
    const colors = datasets[args[0]]
    const sortBy = (options.by || 'hex') as 'name' | 'hex' | 'hue'
    const reverse = options.reverse || options.r

    logger.info(`🔤 Sorting by "${sortBy}" ${reverse ? '(reverse)' : ''}...`)
    logger.info(`📊 Colors: ${colors.length}`)

    const result = this.sortData(colors, sortBy, reverse, logger)

    logger.success(`✅ Sorted: ${result.stats.original} → ${result.stats.sorted}`)
    this.printStats(result.stats, logger)

    return result
  }

  sortData(
    data: ColorData[],
    sortBy: 'name'|'hex'|'hue',
    reverse: boolean,
    logger: Logger
  ): SortResult {
    this.comparisons = 0

    const progress = new ProgressBar({ total: data.length, width: 40 })
    const start = performance.now()

    const sorted = [...data].sort((a, b) => {
      const aKey = this.getSortKey(a, sortBy)
      const bKey = this.getSortKey(b, sortBy)

      this.update(progress)

      if (aKey < bKey) return reverse ?  1 : -1
      if (aKey > bKey) return reverse ? -1 :  1

      return 0
    })

    progress.processing()

    const finish = performance.now()
    logger.info(`PERFORMANCE: ${finish - start} ms`)

    return {
      data: sorted,
      stats: {
        original: data.length,
        sorted: sorted.length,
        field: sortBy,
        reverse,
        uniqueValues: new Set(
          sorted.map(c => this.getSortKey(c, sortBy))
        ).size
      }
    }
  }

  private getSortKey(color: ColorData, sortBy: 'name' | 'hex' | 'hue'): string | number {
    switch (sortBy) {
      case 'name':
        return color.name.toLowerCase()
      case 'hex':
        return color.hex.toLowerCase()
      case 'hue':
        return color.hsl?.h ?? 0
      default:
        return color.name.toLowerCase()
    }
  }

  update(progress: ProgressBar): void {
    this.comparisons++

    progress.accumulate(Math.round(
      Math.min(100, (this.comparisons / progress.total) * 100)
    ))

    progress.update()
  }

  printStats(stats: SortStats, logger: any) {
    logger.info('\n📊 SORTING STATISTICS:')
    logger.info(`Field:    ${stats.field}${stats.reverse ? ' (↕️)' : ''}`)
    logger.info(`Total:    ${stats.original}`)

    if (stats.field === 'hue') {
      const uniquePct = ((stats.uniqueValues / stats.original) * 100).toFixed(1)
      logger.info(`Unique hue: ${stats.uniqueValues} (${uniquePct}%)`)
    } else {
      logger.info(`Unique:     ${stats.uniqueValues}`)
    }
  }
}
