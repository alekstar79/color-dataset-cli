import { ColorMetrics } from '../ColorMetrics'
import { ColorData } from '@/types'

import { colorKernels, colorModifiers } from '../words.ts'

export class SemanticAnalyzer {
  private static instance: SemanticAnalyzer

  private kernels: Record<string, string[]> = colorKernels
  private modifiers: Record<string, string[]> = colorModifiers
  private combiKernels: Record<string, string[]> = {}

  static init(): SemanticAnalyzer {
    return new SemanticAnalyzer()
  }

  constructor() {
    if (SemanticAnalyzer.instance) return SemanticAnalyzer.instance

    for (const [kernel, variants] of Object.entries(this.kernels)) {
      this.combiKernels[kernel] = variants.map(s => s.split(' ').join(''))
    }

    SemanticAnalyzer.instance = this
  }

  includes({ lower, combi }: { lower: string; combi: string }, pure: string, combined?: string): boolean {
    return (
      lower.includes(pure) || pure.includes(lower) || (combined && lower.includes(combined)) || !!combined?.includes(lower) ||
      combi.includes(pure) || pure.includes(combi) || (combined && combi.includes(combined)) || !!combined?.includes(combi)
    )
  }

  extractSemantics(name: string) {
    const lower = name.toLowerCase()
    const combi = lower.split(' ').join('')

    const components = {
      modifiers: [] as string[],
      kernels: [] as string[],
      temperature: null as string | null,
      compound: false,
      hasDash: name.includes('-')
    }

    // Modifiers
    for (const [modType, variants] of Object.entries(this.modifiers)) {
      for (let i = 0; i < variants.length; i++) {
        if (this.includes({ lower, combi }, variants[i])) {
          components.modifiers.push(modType)
          break
        }
      }
    }

    // Kernels
    for (const [kernel, variants] of Object.entries(this.kernels)) {
      const combiVariants = this.combiKernels[kernel]

      for (let i = 0; i < variants.length; i++) {
        if (this.includes({ lower, combi }, variants[i], combiVariants[i])) {
          components.kernels.push(kernel)
          if (['red', 'pink', 'orange'].includes(kernel)) components.temperature = 'warm'
          if (['blue', 'cyan'].includes(kernel)) components.temperature = 'cool'
          break
        }
      }
    }

    components.compound = components.kernels.length > 1 || components.modifiers.length > 0

    return components
  }

  scoreSemanticMatch(color: ColorData): number {
    const hsl = color.hsl!
    const semantics = this.extractSemantics(color.name)

    const family = ColorMetrics.getColorFamily(hsl)
    const temp = ColorMetrics.getTemperature(hsl)
    const satur = ColorMetrics.getSaturation(hsl)
    const light = ColorMetrics.getLightness(hsl)

    let score = 0

    if (semantics.temperature === temp) score += 25
    if (semantics.modifiers.includes('dark') && (light === 'dark' || light === 'very-dark')) score += 15
    if (semantics.modifiers.includes('light') && (light === 'light' || light === 'very-light')) score += 15
    if (semantics.modifiers.includes('bright') && satur === 'saturated') score += 10
    if (semantics.kernels.includes(family)) score += 25

    score += 5 * semantics.kernels.length

    if (semantics.compound) score -= 5

    return Math.min(score, 100)
  }
}
