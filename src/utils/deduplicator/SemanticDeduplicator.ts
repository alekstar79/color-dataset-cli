import { ColorData, DuplicateGroup } from '@/types'

import { SemanticAnalyzer } from './SemanticAnalyzer'
import { StringMetrics } from './StringMetrics'
import { ColorMetrics } from '../ColorMetrics'
import { ProgressBar } from '../ProgressBar'

export interface DeduplicateRawResult {
  colors: ColorData[]
  stats: DuplicateGroup[]
}

export class SemanticDeduplicator {
  private analyzer = SemanticAnalyzer.init()
  private colorMetrics = ColorMetrics

  deduplicate(colors: ColorData[]): DeduplicateRawResult {
    const totalColors = colors.length
    const progress = new ProgressBar({
      showSpeed: true,
      total: totalColors,
      width: 40
    })

    const hexGroups = new Map<string, ColorData[]>()
    const nameGroups = new Map<string, ColorData[]>()

    // STEP 1: HEX Grouping (priority 1)
    let groupCount = 0
    for (const color of colors) {
      const hex = color.hex.toLowerCase()

      if (!hexGroups.has(hex)) {
        hexGroups.set(hex, [])
      }

      hexGroups.get(hex)!.push(color)

      groupCount++
      if (groupCount % 2 === 0) {
        progress.accumulate(groupCount, 0.2)
        progress.update()
      }
    }

    // Choosing winners by HEX groups
    const hexWinners: ColorData[] = []
    const hexDuplicates: DuplicateGroup[] = []

    for (const [hex, group] of hexGroups) {
      if (group.length === 1) {
        hexWinners.push(group[0])
      } else {
        const winner = this.selectBestName(group)
        hexWinners.push(winner)
        hexDuplicates.push({
          hex,
          names: group.map(g => g.name),
          selected: winner.name,
          reason: `${this.getSelectionReason(group, winner)} | HEX`
        })
      }

      groupCount++
      if (groupCount % 2 === 0) {
        progress.accumulate(groupCount, 0.3)
        progress.update()
      }
    }

    // STEP 2. Grouping winners by name (priority 2)
    for (const winner of hexWinners) {
      if (winner.name === '') continue

      const name = winner.name.toLowerCase()

      if (!nameGroups.has(name)) {
        nameGroups.set(name, [])
      }

      nameGroups.get(name)!.push(winner)

      groupCount++
      if (groupCount % 2 === 0) {
        progress.accumulate(groupCount, 0.2)
        progress.update()
      }
    }

    if (!nameGroups.size) return { colors: hexWinners, stats: hexDuplicates }

    // Final result: winners by name
    const finalResult: ColorData[] = []
    const nameDuplicates: DuplicateGroup[] = []

    for (const [, nameGroup] of nameGroups) {
      if (nameGroup.length === 1) {
        finalResult.push(nameGroup[0])
      } else {
        // Choosing the best among HEX winners with the same name
        const winner = this.selectBestName(nameGroup)
        finalResult.push(winner)
        nameDuplicates.push({
          hex: nameGroup.map(c => c.hex).join(', '),
          names: nameGroup.map(g => g.name),
          selected: winner.name,
          reason: `${this.getSelectionReason(nameGroup, winner)} | NAME`
        })
      }
    }

    progress.processing()

    return {
      colors: finalResult,
      stats: hexDuplicates.concat(nameDuplicates)
    }
  }

  private selectBestName(group: ColorData[]): ColorData {
    const scores = group.map((color, idx) => ({
      score: this.calculateScore(color, group, idx),
      color
    }))

    scores.sort((a, b) => {
      return b.score - a.score
    })

    return scores[0].color
  }

  private calculateScore(color: ColorData, group: ColorData[], index: number): number {
    let score = 0

    // 1. Semantic: 50%
    const semanticScore = this.analyzer.scoreSemanticMatch(color)
    score += semanticScore * 0.5

    // 2. Uniqueness: 25%
    let minDistance = Infinity
    for (const other of group) {
      if (other === color) continue
      const dist = StringMetrics.damerauLevenshtein(color.name, other.name)
      minDistance = Math.min(minDistance, dist)
    }
    score += Math.min(minDistance * 10, 100) * 0.25

    // 3. Length: 15%
    const lengthScore = Math.max(0, 10 - Math.abs(color.name.length - 10))
    score += lengthScore * 0.15

    // 4. Priority: 10%
    const priorityScore = (group.length - index) * 5
    score += priorityScore * 0.1

    return score
  }

  private getSelectionReason(group: ColorData[], winner: ColorData): string {
    const reasons: string[] = []
    const names = group.map(g => g.name)

    if (names.includes('gray') && names.includes('grey')) {
      reasons.push('CSS standard')
    }

    const semanticScore = this.analyzer.scoreSemanticMatch(winner)
    if (semanticScore > 50) {
      reasons.push(`Semantic: ${Math.round(semanticScore)}`)
    }

    return reasons.join(' | ')
  }

  generateReport(colors: ColorData[]) {
    const { colors: deduped, stats } = this.deduplicate(colors)

    return {
      summary: {
        original: colors.length,
        deduplicated: deduped.length,
        removed: colors.length - deduped.length,
        removalRate: ((colors.length - deduped.length) / colors.length * 100).toFixed(1) + '%'
      },
      duplicates: stats,
      analysis: {
        byCategory: this.analyzeByCategory(deduped),
        semanticDistribution: this.analyzeSemantic(deduped)
      }
    }
  }

  private analyzeByCategory(colors: ColorData[]) {
    const categories: Record<string, number> = {}

    for (const color of colors) {
      const temp = this.colorMetrics.getTemperature(color.hsl!)
      categories[temp] = (categories[temp] || 0) + 1
    }

    return categories
  }

  private analyzeSemantic(colors: ColorData[]) {
    const distribution: Record<string, number> = {}

    for (const color of colors) {
      const semantics = this.analyzer.extractSemantics(color.name)
      const mainKernel = semantics.kernels[0] || 'unclassified'
      distribution[mainKernel] = (distribution[mainKernel] || 0) + 1
    }

    return distribution
  }
}
