import type { ColorData, ParseResult } from '@/types'

import { ColorMetrics } from '@/utils/ColorMetrics'

import { ASTDetector } from './ASTDetector'
import { ASTParser } from './ASTParser'

export class Parser {
  private detector = new ASTDetector()
  private parser = new ASTParser()

  async parseDataset(data: any): Promise<ParseResult> {
    const startDetect = performance.now()
    const detected = this.detector.detect(data)
    const detectionMs = performance.now() - startDetect

    if (detected.length === 0) {
      throw new Error('Unable to detect dataset format')
    }

    const bestFormat = detected[0]
    const startParse = performance.now()
    const colors = this.parser.parse(data, bestFormat.type) as ColorData[]
    const parsingMs = performance.now() - startParse

    const colorsWithFixedFamily = ColorMetrics.fixFamilies(colors)
    // const fixedCount = colorsWithFixedFamily.filter(c => {
    //   return c.family !== colors.find(col => col.hex === c.hex)?.family
    // }).length

    return {
      format: bestFormat.type,
      colors: colorsWithFixedFamily,
      confidence: bestFormat.confidence,
      metadata: bestFormat.metadata,
      performance: {
        detectionMs,
        parsingMs
      }
    }
  }
}
