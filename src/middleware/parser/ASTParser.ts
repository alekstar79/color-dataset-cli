import { ColorMetrics } from '@/utils/ColorMetrics'
import { ColorData, Tuple } from '@/types'

export class ASTParser {
  parse(data: any, format: string): ColorData[] {
    switch (format) {
      case 'color-palette': return this.parseColorPaletteRecord(data)
      case 'pairs': return this.parseHexStringPairs(data)
      case 'object': return this.parseObjectEntries(data)
      case 'objects': return this.parseArrayOfObjects(data)
      case 'json': return this.parseJsonObjectFormat(data)
      case 'structured': return this.parseStructuredFormat(data)
      default: return []
    }
  }

  private parseColorPaletteRecord(data: Record<string, any>): ColorData[] {
    const colors: ColorData[] = []

    for (const [code, obj] of Object.entries(data)) {
      const colorObj = obj as { name: string; hex: string }

      if (colorObj?.name && colorObj?.hex) {
        try {
          const metrics = this.metrics(colorObj.hex)
          colors.push({
            hex: this.normalizeHex(colorObj.hex),
            name: this.normalizeName(colorObj.name),
            code: code as string,
            family: ColorMetrics.getColorFamily(metrics.hsl),
            originalName: colorObj.name,
            ...metrics
          })
        } catch {}
      }
    }

    return colors
  }

  private parseHexStringPairs(data: any[]): ColorData[] {
    return data.map(([a, b]: [any, any]): ColorData => {
      const hex = /^#?[0-9a-f]{3,8}$/i.test(String(a)) ? a : b
      const name = typeof a === 'string' && !/^#?[0-9a-f]{3,8}$/i.test(String(a)) ? a : b
      const metrics = this.metrics(hex)

      return {
        hex: this.normalizeHex(hex),
        name: this.normalizeName(name),
        family: ColorMetrics.getColorFamily(metrics.hsl),
        originalName: String(name),
        ...metrics
      }
    }).filter(
      item => item.hex && item.name
    )
  }

  private parseObjectEntries(data: Record<string, any>): ColorData[] {
    const colors: ColorData[] = []

    for (const [key, value] of Object.entries(data) as [string, any][]) {
      if (/^#?[0-9a-f]{6,8}$/i.test(key) && typeof value === 'string') {
        const metrics = this.metrics(key)

        colors.push({
          hex: this.normalizeHex(key),
          name: this.normalizeName(value),
          family: ColorMetrics.getColorFamily(metrics.hsl),
          originalName: value,
          ...metrics
        })
      } else if (/^#?[0-9a-f]{6,8}$/i.test(String(value))) {
        const metrics = this.metrics(value)

        colors.push({
          hex: this.normalizeHex(value),
          name: this.normalizeName(key),
          family: ColorMetrics.getColorFamily(metrics.hsl),
          originalName: key,
          ...metrics
        })
      }
    }

    return colors.filter(
      item => item.hex && item.name
    )
  }

  private parseArrayOfObjects(data: any[]): ColorData[] {
    return data.map((item: any) => {
      const metrics = this.metrics(item.hex)

      return {
        hex: this.normalizeHex(item.hex),
        name: this.normalizeName(item.name),
        family: item.family ?? ColorMetrics.getColorFamily(metrics.hsl),
        originalName: item.name,
        ...metrics
      }
    }).filter(
      item => item.hex // && item.name
    )
  }

  private parseStructuredFormat(data: any): ColorData[] {
    const colors: ColorData[] = []

    for (const [category, items] of Object.entries(data)) {
      if (category === 'meta' || !Array.isArray(items)) continue

      items.forEach((item: any) => {
        if (!item.hex || !item.name) return

        const metrics = this.metrics(item.hex)

        colors.push({
          hex: this.normalizeHex(item.hex),
          name: this.normalizeName(item.name),
          family: item.family ?? ColorMetrics.getColorFamily(metrics.hsl),
          originalName: item.name,
          category,
          ...metrics
        })
      })
    }

    return colors.filter(
      item => item.hex && item.name
    )
  }

  private parseJsonObjectFormat(data: Record<string, any>): ColorData[] {
    const colors: ColorData[] = []

    for (const [_, colorObj] of Object.entries(data)) {
      const obj = colorObj as any
      if (obj?.hex && obj?.name && typeof obj.name === 'string') {
        try {
          const metrics = this.metrics(obj.hex)
          colors.push({
            hex: this.normalizeHex(obj.hex),
            name: this.normalizeName(obj.name),
            family: ColorMetrics.getColorFamily(metrics.hsl),
            originalName: obj.name,
            ...metrics
          })
        } catch {
          // invalid hex
        }
      }
    }

    return colors
  }

  private normalizeHex(hex: any): string {
    const str = String(hex).replace(/^#/, '').toLowerCase()

    if (/^[0-9a-f]{3}$/i.test(str)) return `#${str.split('').map(c => c + c).join('')}`
    if (/^[0-9a-f]{6,8}$/i.test(str)) return `#${str.slice(0, 6)}`

    return ''
  }

  private normalizeName(name: any): string {
    return String(name).trim().replace(/\s+/g, ' ')
  }

  private metrics(hex: string): {
    hueRange: Tuple<number, 2>;
    hsl: { h: number; s: number; l: number };
    rgb: Tuple<number, 3>;
  } {
    const {
      hueRange,
      ...hsl
    } = ColorMetrics.hexToHslMetrics(hex)
    return {
      hueRange,
      rgb: ColorMetrics.hexToRgb(hex),
      hsl
    }
  }
}
