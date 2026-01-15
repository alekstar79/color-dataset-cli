import { ColorData, CommandContext, PluginAPI } from '@/types'

import { ColorMetrics } from '@/utils/ColorMetrics'
import { Application } from '@/core/Application'

import { dirname, resolve } from 'node:path'
import { promises as fs } from 'node:fs'

export class DatasetPlugin {
  name = 'dataset'
  version = '1.0.0'
  description = 'Plugin for uploading and saving a dataset'

  install(app: Application, api: PluginAPI): void {
    const { logger } = api

    // app.dataset
    ;(app as any).dataset = {
      load: this.load.bind(this),
      save: this.save.bind(this),
      validate: this.validate.bind(this)
    }

    // Middleware for context
    app.use(async (ctx: CommandContext, next: () => Promise<void>) => {
      ctx.dataset = (app as any).dataset
      await next()
    })

    logger.success(`✅ Plugin ${this.name} v${this.version} is installed`)
  }

  async load(datasetPath: string): Promise<any> {
    try {
      const module = await import(datasetPath)
      return module.default || module
    } catch (error: any) {
      throw new Error(`Loading error "${datasetPath}": ${error.message}`)
    }
  }

  async save(
    data: ColorData[],
    path: string,
    format: string = 'ts',
    logger: any
  ): Promise<void> {
    const absolutePath = resolve(process.cwd(), path)
    const dirPath = dirname(absolutePath)

    try {
      await fs.mkdir(dirPath, { recursive: true })

      let content: string
      if (format === 'json') {
        content = JSON.stringify(data, null, 2)
      } else if (format === 'minify') {
        content = `export default [${data.reduce(this.minify.bind(this), '')}]`
      } else {
        content = `/**\n * Dataset - ${data.length} colors\n * Generated: ${new Date().toLocaleString('ru-RU')}\n */\n\nexport default [\n`

        data.forEach((color, index) => {
          let { hex, name, family, hueRange, rgb, hsl } = color

          family ??= ColorMetrics.getColorFamily(hsl)
          const rgbStr = `[${this.format(rgb[0])}, ${this.format(rgb[1])}, ${this.format(rgb[2])}]`
          const hslStr = `{ h: ${this.format(hsl.h)}, s: ${this.format(hsl.s)}, l: ${this.format(hsl.l)} }`
          content += `  { hex: "${hex}", name: "${name}", family: "${family!.toLowerCase()}", hueRange: [${hueRange![0].toFixed(1)}, ${hueRange![1].toFixed(1)}], rgb: ${rgbStr}, hsl: ${hslStr} }${index < data.length - 1 ? ',' : ''}\n`
        })

        content += `]\n`
      }

      await fs.writeFile(absolutePath, content, 'utf8')
      const stats = await fs.stat(absolutePath)
      logger.success(`💾 Saved: ${absolutePath} (${stats.size} bytes)`)
    } catch (error: any) {
      logger.error(`❌ Saving error ${absolutePath}: ${error.message}`)
      throw error
    }
  }

  minify(acc: string, color: ColorData, index: number, data: ColorData[]): string {
    let { hex, name, family, hueRange, rgb, hsl } = color

    family ??= ColorMetrics.getColorFamily(hsl)
    const rgbStr = `[${this.format(rgb[0])},${this.format(rgb[1])},${this.format(rgb[2])}]`
    const hslStr = `{h:${this.format(hsl.h)},s:${this.format(hsl.s)},l:${this.format(hsl.l)}}`
    acc += `{hex:"${hex}",name:"${name}",family:"${family!.toLowerCase()}",hueRange:[${hueRange![0].toFixed(1)},${hueRange![1].toFixed(1)}],rgb:${rgbStr},hsl:${hslStr}}${index < data.length - 1 ? ',' : ''}`

    return acc
  }

  // Dataset validation
  validate(data: ColorData[]): ColorData[] {
    return data.filter(color =>
      Reflect.has(color, 'name') && Reflect.has(color, 'hex') &&
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.hex)
    )
  }

  format(num: number, fraction: number = 3): string {
    if (Number.isInteger(num)) return num.toString()

    const str = num.toFixed(fraction)

    return str.replace(/\.?0+$/, '')
  }
}
