// Old Logic
// import { CommandContext, ColorData, CopyResult, CopyStats } from '@/types'
// import { ProgressBar } from '../utils/ProgressBar'
// import { Command } from '../core/Command'
//
// export class CopyCommand extends Command {
//   constructor() {
//     super(
//       'copy',
//       '<input> <output>',
//       'Копирование датасета с преобразованием формата',
//       (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
//         this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
//         allowUnknownOptions: false,
//         strict: true,
//         schema: {
//           args: [
//             { name: 'input', required: true, type: 'path'     },
//             { name: 'output', required: false, type: 'output' }
//           ]
//         }
//       }
//     )
//
//     this.option('-o, --output <path>', 'Сохранить результат')
//       .option('--format <format>', 'Формат (json|ts)', 'ts')
//       .validate(({ args }) => !args[0]
//         ? '❌ Укажите путь к исходному датасету: copy <input> <output>'
//         : true
//       )
//       .validate(({ args, options }) => !(options.output || options.o || args[1])
//         ? '❌ Укажите путь для сохранения: copy <input> <output>'
//         : true
//       )
//   }
//
//   async perform(
//     datasets: Record<string, ColorData[]>,
//     _metadata: Record<string, any>,
//     { app, args, logger }: CommandContext
//   ): Promise<CopyResult> {
//     logger.info('📋 Копирование датасета...')
//
//     const colors = datasets[args[0]]
//
//     logger.info(`📊 Цветов: ${colors.length}`)
//
//     const result = this.copydataset(colors)
//     const normalizeNamesCommand = app.commands.get('normalize-name') as any
//     if (!normalizeNamesCommand?.normalizeNames) {
//       throw new Error('❌ Метод normalizeNames не найден')
//     }
//
//     const { data } = normalizeNamesCommand.normalizeNames(result.data, app)
//
//     result.data = data
//
//     logger.success('✅ Копирование завершено')
//     this.printStats(result.stats, logger)
//
//     return result
//   }
//
//   private copydataset(colors: ColorData[]): CopyResult {
//     const progress = new ProgressBar({ total: colors.length, width: 40 })
//     const stats: CopyStats = { total: colors.length, copied: 0, errors: 0 }
//
//     const copiedData = colors.map(color => {
//       try {
//         const copied = { ...color }
//         stats.copied++
//         progress.update(1)
//         return copied
//       } catch {
//         stats.errors++
//         progress.update(1)
//         return color
//       }
//     })
//
//     progress.processing()
//
//     return { stats, data: copiedData }
//   }
//
//   private printStats(stats: CopyStats, logger: any) {
//     logger.info('\n📊 СТАТИСТИКА КОПИРОВАНИЯ:')
//     logger.info(`  Всего: ${stats.total}`)
//     logger.info(`  ✅ Скопировано: ${stats.copied}`)
//     logger.info(`  ❌ Ошибок: ${stats.errors}`)
//   }
// }

// New Logic
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
      'Копирование датасета с преобразованием формата',
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

    this.option('-o', '--output <path>', 'Сохранить результат')
      .option('--format <format>', 'Формат (json|ts)', 'ts')
      .option('--no-smart', 'Без обработки')
      .option('--capitalize-only', 'Только capitalize')
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { app, args, options, logger }: CommandContext
  ): Promise<CopyResult> {

    const colors = datasets[args[0]]
    const doSmart = !options.noSmart
    const onlyCapitalize = options['capitalize-only']

    logger.info('📋 Копирование датасета...')
    logger.info(`📊 Цветов: ${colors.length}`)

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
        logger.success(`✅ Normalize: ${normResult.nameStats.changed} изменено`)
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
    logger.info('\n📊 СТАТИСТИКА:')
    logger.info(`  ✅ Скопировано: ${stats.copied}/${stats.total}`)
    logger.info(`  ❌ Ошибок: ${stats.errors || 0}`)
  }
}
