// Old Logic
// import { ColorData, CommandContext, CapitalizeResult } from '@/types'
// import { ProgressBar } from '../utils/ProgressBar'
// import { Command } from '../core/Command'
//
// export class CapitalizeCommand extends Command {
//   constructor() {
//     super(
//       'capitalize',
//       '<dataset> [output]',
//       'Привести названия цветов к Title Case (первая буква заглавная)',
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
//     this.option('-o, --output <path>', 'Сохранить результат')
//       .option('--format <format>', 'Формат (json|ts)', 'ts')
//   }
//
//   async perform(
//     datasets: Record<string, ColorData[]>,
//     _metadata: Record<string, any>,
//     { args, logger }: CommandContext
//   ): Promise<CapitalizeResult> {
//     logger.info('🔬 Запуск TitleCase наименований...')
//
//     const colors = datasets[args[0]]
//     logger.info(`📊 Исходных цветов: ${colors.length}`)
//
//     const result = this.capitalizeNames(colors)
//     logger.success(`✅ Названия приведены к Title Case`)
//     logger.info(`📈 ${result.original} → ${result.capitalized} цветов обработано`)
//
//     return result
//   }
//
//   capitalizeNames(data: ColorData[]): CapitalizeResult {
//     const progress = new ProgressBar({
//       showSpeed: true,
//       total: data.length,
//       width: 40
//     })
//
//     const capitalized: ColorData[] = []
//
//     for (const color of data) {
//       const titleCaseName = this.capitalize(color.name)
//
//       capitalized.push({ ...color, name: titleCaseName })
//       progress.update(1)
//     }
//
//     progress.processing()
//
//     return {
//       original: data.length,
//       capitalized: capitalized.length,
//       data: capitalized
//     }
//   }
//
//   capitalize(name: string): string {
//     return name.split(/\s+/)
//       .map(word => word.length ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
//       .filter(Boolean)
//       .join(' ')
//   }
// }

// New Logic
import { ColorData, CommandContext, CapitalizeResultExtended } from '@/types'
import { ProgressBar } from '../utils/ProgressBar'
import { Command } from '../core/Command'

export class CapitalizeCommand extends Command {
  constructor() {
    super(
      'capitalize',
      '<dataset> [output]',
      'Title Case + dash-case → spaced words (2-3 слова)',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'dataset', required: true, type: 'path' },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      }
    )

    this.option('-o', '--output <path>', 'Сохранить результат')
      .option('--format <format>', 'Формат (json|ts)', 'ts')
      .option('--smart', 'Smart capitalize (dash-case → spaces)', true)
      .option('--strict', 'Только Title Case без dash')
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, logger, options }: CommandContext
  ): Promise<CapitalizeResultExtended> {
    const useSmart = options.smart !== false
    const colors = datasets[args[0]!]

    logger.info(`🔬 Smart Capitalization ${useSmart ? '+ Dash → Spaces' : '(Title Case)'}`)
    logger.info(`📊 Цветов: ${colors.length}`)

    const result = this.processColors(colors, { smart: useSmart })
    logger.success(`✅ Обработано: ${result.original} → ${result.capitalized}`)
    this.printTransformStats(result, logger)

    return result
  }

  public processColors(
    colors: ColorData[],
    options: { smart?: boolean } = { smart: true }
  ): CapitalizeResultExtended {
    const progress = new ProgressBar({
      total: colors.length,
      width: 40
    })

    const stats = this.createStats()
    const processed: ColorData[] = []

    for (const color of colors) {
      const result = this.smartCapitalize(color.name, options)

      processed.push({
        ...color,
        name: result.name,
        nameTransform: {
          original: color.name,
          transformed: result.name,
          wasChanged: result.wasChanged,
          operations: result.operations,
          type: result.type
        }
      })

      this.updateStats(stats, result)

      progress.update(1)
    }

    progress.processing()

    return {
      original: colors.length,
      capitalized: processed.length,
      data: processed,
      transformStats: stats
    }
  }

  public capitalize(name: string): string {
    return this.smartCapitalize(name, { smart: true }).name
  }

  public smartCapitalize(name: any, options: { smart?: boolean }): {
    name: string,
    wasChanged: boolean,
    operations: string[],
    type: 'dash' | 'space' | 'camel' | 'none'
  } {
    if (!name || typeof name !== 'string') {
      return { name: 'Unknown', wasChanged: false, operations: [], type: 'none' }
    }

    const original = name.trim()
    const smart = options.smart ?? true
    const operations: string[] = []

    let processed = original
    if (smart) {
      processed = processed
        .replace(/([a-zA-Z])(-+)([a-zA-Z])/g, '$1 $3')
        .replace(/-+/g, ' ')
        .trim()

      if (processed !== original) operations.push('dash→space')
    }

    const titleWords = processed
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .filter(Boolean)
      .slice(0, 3)

    const titleCase = titleWords.join(' ')
    const wasChanged = titleCase !== original
    const type = original.includes('-')
      ? 'dash'
      : original.includes(' ')
        ? 'space'
        : original !== original.toLowerCase()
          ? 'camel'
          : 'none'

    if (titleCase !== original) operations.push('title-case')

    return {
      name: titleCase,
      wasChanged,
      operations,
      type
    }
  }

  private createStats() {
    return {
      dashTransformed: 0,
      camelTransformed: 0,
      spaceNormalized: 0,
      unchanged: 0,
      totalOperations: 0
    }
  }

  private updateStats(stats: any, result: any) {
    stats.totalOperations += result.operations.length
    switch (result.type) {
      case 'dash': stats.dashTransformed++; break
      case 'camel': stats.camelTransformed++; break
      case 'space': stats.spaceNormalized++; break
      default: stats.unchanged++
    }
  }

  private printTransformStats(result: CapitalizeResultExtended, logger: any) {
    const stats = result.transformStats
    if (!stats) return

    logger.info('\n📊 ТРАНСФОРМАЦИИ:')
    logger.info(`  Dash-case: ${stats.dashTransformed}`)
    logger.info(`  CamelCase: ${stats.camelTransformed}`)
    logger.info(`  Spaces:    ${stats.spaceNormalized}`)
    logger.info(`  Без zmian: ${stats.unchanged}`)
  }
}
