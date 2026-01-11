import { CommandContext, ColorData } from '@/types'
import { Command } from '../core/Command'
import { Logger } from '../utils/Logger'

import { writeFile } from 'fs/promises'

interface PriorityMergeStats {
  originalPrimary: number
  originalSecondary: number
  totalUnique: number
  skippedFromSecondary: number
  skipRate: string
  deltaEThreshold: number
}

interface PriorityMergeResult {
  data: ColorData[]
  stats: PriorityMergeStats
}

export class PriorityMergeCommand extends Command {
  constructor() {
    super(
      'pmerge',
      '<primary> <secondary> [output]',
      'Слияние датасетов с приоритетами: цвета из primary перекрывают secondary',
      (_args: string[], _options: Record<string, any>, _flags: string[], ctx: CommandContext) =>
        this.perform(ctx.parsedDatasets!, ctx.parseMetadata!, ctx), {
        allowUnknownOptions: false,
        strict: true,
        schema: {
          args: [
            { name: 'primary', required: true, type: 'path' },
            { name: 'secondary', required: true, type: 'path' },
            { name: 'output', required: false, type: 'output' }
          ]
        }
      }
    )

    this.option('-t, --threshold <number>', 'DeltaE порог для дубликатов', '2.3')
      .option('--format <format>', 'Формат (json|ts)', 'ts')
      .option('--report', 'Показать подробный отчёт')
      .option('--save-report <path>', 'Сохранить отчёт')
      .validate(({ args }) => {
        if (!args[0] || !args[1]) {
          return '❌ Укажите primary и secondary датасеты: pmerge <primary> <secondary> [output]'
        }
        return true
      })
  }

  async perform(
    datasets: Record<string, ColorData[]>,
    _metadata: Record<string, any>,
    { args, options, logger }: CommandContext
  ): Promise<PriorityMergeResult> {
    logger.info('🔗 Приоритетное слияние датасетов...')

    const primaryColors = datasets[args[0]]
    const secondaryColors = datasets[args[1]]
    const threshold = parseFloat(options.threshold as string) || 2.3
    const showReport = options.report

    logger.info(`📊 Primary:   ${primaryColors.length} цветов`)
    logger.info(`📊 Secondary: ${secondaryColors.length} цветов`)
    logger.info(`🎯 DeltaE:    ${threshold}`)

    const result = this.merge(primaryColors, secondaryColors, threshold)

    logger.success(`✅ Слияние завершено: ${result.stats.totalUnique} уникальных цветов`)
    this.printStats(result.stats, logger)

    if (showReport) {
      this.printDetailedReport(result, args, logger)
    }
    if (options.saveReport) {
      await this.saveReport(result, options.saveReport, logger)
    }

    return result
  }

  private merge(
    primary: ColorData[],
    secondary: ColorData[],
    deltaEThreshold: number
  ): PriorityMergeResult {
    // Map для быстрого поиска по HEX в primary
    const primaryMap = new Map(primary.map(c => [c.hex, c]))

    // 1. Точные совпадения HEX
    const exactMatches = secondary.filter(c => primaryMap.has(c.hex)).map(c => c.hex)

    // 2. Близкие по DeltaE (используем rgb из ColorData)
    const closeMatches: string[] = []
    for (const secColor of secondary) {
      if (exactMatches.includes(secColor.hex)) continue

      for (const primColor of primary) {
        const deltaE = this.calculateDeltaE(secColor.rgb, primColor.rgb)
        if (deltaE < deltaEThreshold) {
          closeMatches.push(secColor.hex)
          break
        }
      }
    }

    const skippedHexes = new Set([...exactMatches, ...closeMatches])

    // 3. Добавляем только уникальные из secondary
    const uniqueFromSecondary = secondary.filter(c => !skippedHexes.has(c.hex))

    const merged = [...primary, ...uniqueFromSecondary].sort((a, b) =>
      a.hex.localeCompare(b.hex)
    )

    const stats: PriorityMergeStats = {
      originalPrimary: primary.length,
      originalSecondary: secondary.length,
      totalUnique: merged.length,
      skippedFromSecondary: skippedHexes.size,
      skipRate: ((skippedHexes.size / secondary.length * 100).toFixed(1)),
      deltaEThreshold
    }

    return { data: merged, stats }
  }

  /** Простая DeltaE реализация (CIE76) используя rgb из ColorData */
  private calculateDeltaE(rgb1: ColorData['rgb'], rgb2: ColorData['rgb']): number {
    // Конвертируем [0-255] в Lab приблизительно через XYZ
    const lab1 = this.rgbToLab(rgb1)
    const lab2 = this.rgbToLab(rgb2)

    // CIE76 DeltaE
    const deltaL = lab1[0] - lab2[0]
    const deltaA = lab1[1] - lab2[1]
    const deltaB = lab1[2] - lab2[2]

    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB)
  }

  private rgbToLab(rgb: ColorData['rgb']): [number, number, number] {
    // Приблизительная конверсия RGB → XYZ → Lab
    // Нормализуем 0-255 → 0-1
    const [r, g, b] = rgb.map(c => c / 255)

    // sRGB → XYZ (упрощённая матрица D65)
    const r_ = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    const g_ = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    const b_ = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    const x = r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805
    const y = r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722
    const z = r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505

    // XYZ → Lab
    const x_ = x / 0.95047
    const y_ = y
    const z_ = z / 1.08883

    const fx = x_ > 0.008856 ? Math.pow(x_, 1 / 3) : (x_ * 903.3 + 16) / 116
    const fy = y_ > 0.008856 ? Math.pow(y_, 1 / 3) : (y_ * 903.3 + 16) / 116
    const fz = z_ > 0.008856 ? Math.pow(z_, 1 / 3) : (z_ * 903.3 + 16) / 116

    return [
      116 * fy - 16,
      500 * (fx - fy),
      200 * (fy - fz)
    ]
  }

  printStats(stats: PriorityMergeStats, logger: any) {
    logger.info('\n📊 СТАТИСТИКА СЛИЯНИЯ:')
    logger.info(`Primary:     ${stats.originalPrimary}`)
    logger.info(`Secondary:   ${stats.originalSecondary}`)
    logger.info(`Уникальных:  ${stats.totalUnique}`)
    logger.info(`Пропущено:   ${stats.skippedFromSecondary}`)
    logger.info(`Процент:     ${stats.skipRate}%`)
    logger.info(`DeltaE:      ${stats.deltaEThreshold}`)
  }

  private printDetailedReport(result: PriorityMergeResult, _args: string[], logger: any) {
    logger.info('\n📈 ПЕРВЫЕ 10 ПРИМЕРОВ ПРИОРИТЕТА:')

    const primaryColors = result.data.filter(c =>
      result.data.findIndex(pc => pc.hex === c.hex) < result.stats.originalPrimary
    )

    for (const color of primaryColors.slice(0, 10)) {
      logger.info(`  ${color.hex}: "${color.name}" (primary приоритет)`)
    }
  }

  private async saveReport(result: PriorityMergeResult, path: string, logger: Logger) {
    const report = {
      stats: result.stats,
      sample: result.data.slice(0, 50),
      breakdown: {
        total: result.data.length,
        primaryRatio: ((result.stats.originalPrimary / result.data.length) * 100).toFixed(1)
      }
    }

    await writeFile(path, JSON.stringify(report, null, 2), 'utf-8')
    logger.success(`📄 Отчёт сохранён: ${path}`)
  }
}
