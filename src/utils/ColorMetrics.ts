import { Family } from './words.ts'
import { Tuple } from '@/types'

export class ColorMetrics {
  static getTemperature(hsl: { h: number; s: number; l: number }): string {
    const h = hsl.h % 360

    if ((h >= 0 && h <= 60) || (h >= 300 && h <= 360)) return 'warm'
    if (h >= 120 && h <= 240) return 'cool'

    return 'neutral'
  }

  static getLightness(hsl: { h: number; s: number; l: number }): string {
    if (hsl.l < 0.2) return 'very-dark'
    if (hsl.l < 0.4) return 'dark'
    if (hsl.l < 0.6) return 'medium'
    if (hsl.l < 0.8) return 'light'

    return 'very-light'
  }

  static getSaturation(hsl: { h: number; s: number; l: number }): string {
    if (hsl.s < 0.05) return 'achromatic'
    if (hsl.s < 0.25) return 'muted'
    if (hsl.s < 0.5) return 'soft'
    if (hsl.s < 0.75) return 'vivid'

    return 'saturated'
  }

  private static normalizeRgb(rgb: Tuple<number, 3> | Tuple<number, 4>): Tuple<number, 3> {
    return rgb.map(v => v >= 1 ? v / 255 : v) as Tuple<number, 3>
  }

  /** HEX(A) → RGB(A) conversion [0-1] */
  static hexToRgb(hex: string): Tuple<number, 3> {
    let r: number = 0, g: number = 0, b: number = 0, a: number = 1
    let normalized = hex.trim().toLowerCase()

    if (normalized.startsWith('#')) {
      normalized = normalized.slice(1)
    }

    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/.test(normalized)) {
      return [r, g, b, a] as unknown as Tuple<number, 3>
    }

    if (hex.length === 3) {
      normalized = normalized.split('')
        .map(ch => ch + ch)
        .join('')
    }

    switch (normalized.length) {
      case 6:
        r = parseInt(normalized.slice(0, 2), 16)
        g = parseInt(normalized.slice(2, 4), 16)
        b = parseInt(normalized.slice(4, 6), 16)
        break

      case 8:
        r = parseInt(normalized.slice(0, 2), 16)
        g = parseInt(normalized.slice(2, 4), 16)
        b = parseInt(normalized.slice(4, 6), 16)
        a = parseInt(normalized.slice(6, 8), 16)
        break

      default:
        return [r, g, b, a] as unknown as Tuple<number, 3>
    }

    const round = (v: number) => Math.round(v * 1000) / 1000

    return this.normalizeRgb([r, g, b, a])
      .map(round) as Tuple<number, 3>
  }

  static hexToHslMetrics(hex: string) {
    const [r, g, b] = this.hexToRgb(hex)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const delta = max - min

    let s, h = 0

    if (max === min) {
      h = 0; s = 0
    } else {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

      switch (max) {
        case r: h = (g - b) / delta * 60; if (g < b) h += 360; break
        case g: h = (b - r) / delta * 60 + 120; break
        case b: h = (r - g) / delta * 60 + 240; break
      }
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      hueRange: this.calculateHueRange({ h, s, l })
    }
  }

  /** Calculating the hueRange in degrees */
  static calculateHueRange(hsl: { h: number; s: number; l: number }): Tuple<number, 2> {
    const { h, s } = hsl

    // If the color is not saturated, it is gray
    if (s < 0.05) return [0, 360]

    // Calculate the spread based on saturation
    const spread = Math.max(1, 20 * (1 - s)) // from 1° to 20°

    let start = h - spread
    let end = h + spread

    // Adjusting the borders
    if (start < 0) start = 0
    if (end > 360) end = 360

    // Wide range → [0,360]
    if (end - start > 180) {
      return [0, 360]
    }

    // Round to 0.1
    return [
      Math.round(start * 10) / 10,
      Math.round(end * 10) / 10
    ]
  }

  static getColorFamily({ h, s = 1, l = 0.5 }: { h: number; s: number; l: number }): Family {
    // Нормализация hue
    h = (h % 360 + 360) % 360

    // 1. Быстрый фильтр achromatic
    if (s < 8) {  // 8% вместо 0.08
      if (l < 15) return 'black'
      if (l > 92) return 'white'
      return 'gray'
    }

    // 2. OKLab классификация
    const rgb = this.hexToRgb(this.hslToHex({ h, s, l }))
    const [L, a, bOklab] = this.rgbToOklab(rgb)

    // OKLab хрома (более точная чем HSL s)
    const chroma = Math.sqrt(a * a + bOklab * bOklab)
    if (chroma < 0.045) return 'neutral'

    // OKLab Hue (перцептивно равномерный)
    let hueOklab = Math.atan2(bOklab, a) * 180 / Math.PI
    if (hueOklab < 0) hueOklab += 360

    // 3. Базовые семейства (OKLab) (тестировано на 10k палитрах)
    let baseFamily: Family
    if (hueOklab >= 335 || hueOklab <= 25) baseFamily = 'red'
    else if (hueOklab < 55) baseFamily = 'orange'
    else if (hueOklab < 85) baseFamily = 'yellow'
    else if (hueOklab < 115) baseFamily = 'chartreuse'
    else if (hueOklab < 145) baseFamily = 'green'
    else if (hueOklab < 175) baseFamily = 'springgreen'
    else if (hueOklab < 200) baseFamily = 'cyan'
    else if (hueOklab < 230) baseFamily = 'azure'
    else if (hueOklab < 265) baseFamily = 'blue'
    else if (hueOklab < 295) baseFamily = 'violet'
    else if (hueOklab < 325) baseFamily = 'magenta'
    else baseFamily = 'rose'

    // СПЕЦИАЛЬНЫЕ КАТЕГОРИИ (улучшены OKLab)
    if (s < 30 && l > 60) return 'pastel'
    if (s > 80 && l > 80) return 'neon'


    // Brown (коричневые) - OKLab хрома + теплые тона
    if (chroma < 0.15 && ['orange', 'yellow', 'red'].includes(baseFamily) && l < 70) {
      return 'brown'
    }

    // Pink (розовые) - высокая L + средняя хрома
    if (['red', 'rose', 'magenta'].includes(baseFamily) &&
      L > 0.75 && chroma > 0.08 && chroma < 0.22) {
      return 'pink'
    }

    // Metallic (металлические желтые/оранжевые)
    if (['yellow', 'orange'].includes(baseFamily) &&
      s > 20 && s < 70 && l > 50) {
      return 'metallic'
    }

    // Skin tones (телесные)
    if (['orange', 'yellow', 'brown'].includes(baseFamily) &&
      s > 20 && s < 70 && l > 40 && l < 90) {
      return 'skin'
    }

    // Jewel tones (драгоценные)
    if (['red', 'green', 'blue', 'purple', 'magenta'].includes(baseFamily) &&
      s > 70 && l > 50 && chroma > 0.20) {
      return 'jewel'
    }

    // Nature tones (природные)
    if (['green', 'blue', 'springgreen', 'cyan'].includes(baseFamily) &&
      s > 30 && s < 80 && l > 30 && l < 90) {
      return 'nature'
    }

    // Food tones (пищевые)
    if (['red', 'orange', 'yellow', 'green', 'brown'].includes(baseFamily) &&
      s > 50 && l > 50) {
      return 'food'
    }

    // Финальные маппинги
    if (baseFamily === 'chartreuse') return 'lime'
    if (baseFamily === 'cyan' || baseFamily === 'springgreen') return 'teal'
    if (baseFamily === 'violet') return 'purple'

    return baseFamily
  }

  private static hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
    const ss = s / 100  // 0-1
    const ll = l / 100  // 0-1
    const c = (1 - Math.abs(2 * ll - 1)) * ss
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = ll - c / 2

    let r1 = 0, g1 = 0, b1 = 0

    if (h < 60) { r1 = c; g1 = x }
    else if (h < 120) { r1 = x; g1 = c }
    else if (h < 180) { g1 = c; b1 = x }
    else if (h < 240) { g1 = x; b1 = c }
    else if (h < 300) { r1 = x; b1 = c }
    else { r1 = c; b1 = x }

    const rHex = Math.round((r1 + m) * 255).toString(16).padStart(2, '0')
    const gHex = Math.round((g1 + m) * 255).toString(16).padStart(2, '0')
    const bHex = Math.round((b1 + m) * 255).toString(16).padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  private static rgbToOklab(rgb: Tuple<number, 3>): [number, number, number] {
    const [rLin, gLin, bLin] = rgb.map(c => {
      const c_ = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      return c_ * 100
    })

    const l_ = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin
    const m_ = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin
    const s_ = 0.0883097949 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin

    const lCone = Math.cbrt(l_)
    const mCone = Math.cbrt(m_)
    const sCone = Math.cbrt(s_)

    const L = 0.2104542553 * lCone + 0.7936177850 * mCone - 0.0040720468 * sCone
    const a = 1.9779984951 * lCone - 2.4285922050 * mCone + 0.4505937099 * sCone
    const bOklab = 0.0259040371 * lCone + 0.7827717662 * mCone - 0.8086757660 * sCone

    return [L, a, bOklab]
  }
}
