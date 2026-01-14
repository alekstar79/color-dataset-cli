// noinspection JSUnusedGlobalSymbols

interface Span {
  name: string
  start: number
  end: number | null
  duration: number | null
  metadata: Record<string, any>
}

interface TraceError {
  timestamp: number
  message: string
  stack: string
  spans: Span[]
}

interface TraceReport {
  enabled: boolean
  totalTime: number
  spans: Span[]
  errors: TraceError[]
}

export class Tracer {
  enabled: boolean = false
  private spans: Span[] = []
  private errors: TraceError[] = []
  private startTime: number | null = null

  enable(): void {
    this.enabled = true
    this.startTime = performance.now()
  }

  disable(): void {
    this.enabled = false
  }

  startSpan(name: string, metadata: Record<string, any> = {}): () => void {
    if (!this.enabled) return () => {}

    const span: Span = {
      name,
      start: performance.now(),
      end: null,
      duration: null,
      metadata
    }

    this.spans.push(span)

    return () => {
      span.end = performance.now()
      span.duration = span.end - span.start
    }
  }

  recordError(error: Error): void {
    this.errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack || '',
      spans: [...this.spans]
    })
  }

  getReport(): TraceReport {
    return {
      enabled: this.enabled,
      totalTime: this.startTime ? performance.now() - this.startTime : 0,
      spans: this.spans.filter((s) => s.duration !== null),
      errors: this.errors
    }
  }

  printReport(): void {
    if (!this.enabled || this.spans.length === 0) return

    console.log('\n' + '='.repeat(50))
    console.log('TRACE REPORT')
    console.log('='.repeat(50))

    this.spans.forEach((span, i) => {
      if (span.duration !== null) {
        console.log(`${i + 1}. ${span.name}: ${span.duration.toFixed(2)}ms`)
        if (Object.keys(span.metadata).length > 0) {
          console.log(`   Metadata:`, span.metadata)
        }
      }
    })

    if (this.errors.length > 0) {
      console.log('\nERRORS:')
      this.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.message}`)
      })
    }

    console.log('='.repeat(50) + '\n')
  }
}
