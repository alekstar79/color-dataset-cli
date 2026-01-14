import { ColorData, DistributionPhase, Tuple } from '@/types'

import { ColorMetrics } from '../ColorMetrics'
import { ProgressBar } from '../ProgressBar'
import { Logger } from '../Logger'

export class DatasetDistribution {
  private readonly totalColors: number = 0

  constructor(totalColors: number) {
    this.totalColors = totalColors
  }

  generateStructuredDataset(logger: Logger): ColorData[] {
    const colors: ColorData[] = []

    // 5 PHASES COVER THE ENTIRE SPECTRUM
    const phases: DistributionPhase[] = [
      {
        name: 'Primary Colors',
        targetFamilies: ['red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'blue', 'magenta'],
        hRanges: [[0, 360]],
        sRange: [75, 100],
        lRange: [35, 65],
        step: 2.0,
        ratio: 0.45
      },
      {
        name: 'Pastels & Neutrals',
        targetFamilies: ['pastel', 'neutral'],
        hRanges: [[0, 360]],
        sRange: [10, 30],
        lRange: [60, 90],
        step: 3.0,
        ratio: 0.20
      },
      {
        name: 'Neons & Jewel',
        targetFamilies: ['neon', 'jewel'],
        hRanges: [[0, 360]],
        sRange: [85, 100],
        lRange: [30, 70],
        step: 1.5,
        ratio: 0.15
      },
      {
        name: 'Deep Tones',
        targetFamilies: ['vintage', 'cosmic', 'purple'],
        hRanges: [[0, 360]],
        sRange: [60, 95],
        lRange: [15, 45],
        step: 2.5,
        ratio: 0.12
      },
      {
        name: 'Special Cases',
        targetFamilies: ['brown', 'pink', 'skin', 'teal', 'earth', 'gray'],
        hRanges: [[0, 360]],
        sRange: [15, 70],
        lRange: [25, 75],
        step: 4.0,
        ratio: 0.08
      }
    ]

    for (const phase of phases) {
      const phaseTarget = Math.floor(this.totalColors * phase.ratio)
      let phaseGenerated = 0

      logger.info(`  📦 ${phase.name}: ${phaseTarget} цветов (${(phase.ratio*100).toFixed(0)}%)`)
      const pb = new ProgressBar({ total: phaseTarget })

      // Generating exactly phaseTarget colors
      while (phaseGenerated < phaseTarget && colors.length < this.totalColors) {
        // Evenly distributed across the spectrum
        const h = Math.random() * 360
        const s = phase.sRange[0] + Math.random() * (phase.sRange[1] - phase.sRange[0])
        const l = phase.lRange[0] + Math.random() * (phase.lRange[1] - phase.lRange[0])

        const hNorm = Math.round(h)
        const sNorm = Math.round(s)
        const lNorm = Math.round(l)

        const hex = ColorMetrics.hslToHex({ h: hNorm, s: sNorm, l: lNorm })
        const family = ColorMetrics.getColorFamily({ h: hNorm, s: sNorm, l: lNorm })
        const rgb = ColorMetrics.hexToRgb(hex)

        colors.push({
          hex,
          name: '',
          family,
          hueRange: ColorMetrics.hexToHslMetrics(hex).hueRange,
          rgb: rgb as Tuple<number, 3>,
          hsl: { h: hNorm, s: sNorm, l: lNorm }
        })

        phaseGenerated++
        pb.update(1)

        if (colors.length >= this.totalColors) break
      }

      pb.processing()
    }

    return colors.slice(0, this.totalColors)
  }
}
