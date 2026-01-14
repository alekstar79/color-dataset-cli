import { ColorData, Family } from '@/types'

import { Logger } from '../Logger'

export class FamilyCoverageAnalyzer {
  readonly TOTAL_FAMILIES = 34

  validate(colors: ColorData[], logger: Logger): {
    families: Set<Family>;
    coverage: number;
    quality: number;
  } {
    const families = new Set(colors.map(c => c.family) as Family[])
    const coverage = this.getCoverage(colors)
    const quality = this.calculateQualityScore(colors, coverage)

    logger.info('\n☵ ВАЛИДАТОР:')
    logger.info(`📊 Покрытие: ${coverage}/${this.TOTAL_FAMILIES} (${(coverage/this.TOTAL_FAMILIES * 100).toFixed(1)}%)`)
    logger.info(`🎯 Качество: ${quality.toFixed(1)}/100`)

    return { families, coverage, quality }
  }

  getCoverage(colors: ColorData[]): number {
    return new Set(colors.map(c => c.family)).size
  }

  // printFinalReport(colors: ColorData[], logger: Logger) {
  //   const stats = this.getFamilyStats(colors)
  //
  //   logger.info('\n📈 ФИНАЛЬНАЯ СТАТИСТИКА СЕМЕЙСТВ:')
  //
  //   const sorted = Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
  //   sorted.slice(0, 10).forEach(([family, count]) => {
  //     logger.info(`  🟢 ${family.padEnd(12)}: ${count.toString().padStart(4)}`)
  //   })
  //
  //   if (sorted.length > 10) {
  //     logger.info(`  ... и ещё ${sorted.length - 10} семейств`)
  //   }
  // }

  private getFamilyStats(colors: ColorData[]) {
    const stats = new Map<Family, number>()

    for (const color of colors) {
      stats.set(color.family as Family, (stats.get(color.family as Family) || 0) + 1)
    }

    return stats
  }

  private calculateQualityScore(colors: ColorData[], coverage: number): number {
    const uniformity = this.checkHueUniformity(colors)
    const balance = this.checkFamilyBalance(colors)

    return Math.round(
      (coverage / this.TOTAL_FAMILIES * 40) +
      (uniformity * 30) +
      (balance * 30)
    )
  }

  private checkHueUniformity(colors: ColorData[]): number {
    const hues = colors.map(c => c.hsl.h).sort((a, b) => a - b)
    const gaps = []

    for (let i = 1; i < hues.length; i++) {
      gaps.push(hues[i] - hues[i-1])
    }

    const avgGap = 360 / hues.length
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length
    return Math.max(0, 1 - Math.sqrt(variance) / avgGap)
  }

  private checkFamilyBalance(colors: ColorData[]): number {
    const stats = this.getFamilyStats(colors)
    const avg = colors.length / stats.size
    const deviations = Array.from(stats.values()).map(count => Math.abs(count - avg) / avg)
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length

    return Math.max(0, 1 - avgDeviation)
  }
}
