import {ColorData, Family, Tuple} from '@/types'

import { ColorMetrics } from '../ColorMetrics'
import { Logger } from '../Logger'

export class DatasetBalancer {
  balance(colors: ColorData[], tolerance: number, logger: Logger): ColorData[] {
    const stats = this.analyzeFamilyDistribution(colors)
    const targetCount = colors.length

    logger.info(`⚖️  Фаза 2: Балансировка семейств...`)

    // Находим дисбалансы
    const imbalances = this.findImbalances(stats, tolerance, targetCount)
    logger.info(`⚠️  Найдено ${imbalances.length} дисбалансов (±${tolerance}%)`)

    let balanced = [...colors]

    // Исправляем дисбалансы
    for (const imbalance of imbalances) {
      if (imbalance.delta > 0) {
        // Недостаток - добавляем
        const added = this.generateForFamily(imbalance.family, imbalance.targetCount)
        balanced.push(...added)
        logger.info(`  🔧 ${imbalance.family}: +${added.length} (${(added.length/targetCount*100).toFixed(1)}%)`)
      }
    }

    // Обрезаем до целевого количества
    return balanced.slice(0, targetCount)
  }

  private analyzeFamilyDistribution(colors: ColorData[]): Map<Family, number> {
    const stats = new Map<Family, number>()

    for (const color of colors) {
      const count = stats.get(color.family as Family) || 0
      stats.set(color.family as Family, count + 1)
    }

    return stats
  }

  private findImbalances(
    stats: Map<Family, number>,
    tolerance: number,
    total: number
  ): Array<{ family: Family, current: number, targetCount: number, delta: number }> {
    const imbalances: Array<{ family: Family, current: number, targetCount: number, delta: number }> = []

    for (const [family, current] of stats) {
      const percentage = (current / total) * 100
      const targetPercentage = 2.5 // ~по 4% на семейство
      const targetCount = Math.floor(total * targetPercentage / 100)

      if (Math.abs(percentage - targetPercentage) > tolerance) {
        imbalances.push({
          family,
          current,
          targetCount,
          delta: targetCount - current
        })
      }
    }

    return imbalances.slice(0, 3)
  }

  private generateForFamily(family: Family, count: number): ColorData[] {
    const colors: ColorData[] = []
    let attempts = 0

    while (colors.length < count && attempts < count * 5) {
      attempts++
      const h = Math.random() * 360
      const s = 20 + Math.random() * 80
      const l = 20 + Math.random() * 60

      const hNorm = Math.round(h)
      const sNorm = Math.round(s)
      const lNorm = Math.round(l)

      if (ColorMetrics.getColorFamily({ h: hNorm, s: sNorm, l: lNorm }) === family) {
        const hex = ColorMetrics.hslToHex({ h: hNorm, s: sNorm, l: lNorm })
        colors.push({
          hex,
          name: '',
          family,
          hueRange: ColorMetrics.hexToHslMetrics(hex).hueRange,
          rgb: ColorMetrics.hexToRgb(hex) as Tuple<number, 3>,
          hsl: { h: hNorm, s: sNorm, l: lNorm }
        })
      }
    }

    return colors
  }
}
