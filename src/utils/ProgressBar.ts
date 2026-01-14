export interface ProgressBarOptions {
  total: number
  width?: number
  showPercent?: boolean
  showSpeed?: boolean
}

export class ProgressBar {
  readonly total: number
  readonly width: number
  readonly showPercent: boolean
  readonly showSpeed: boolean
  private current: number = 0
  private startTime: number = Date.now()
  private accumulationMode: boolean = false
  private k: number

  constructor(options: ProgressBarOptions) {
    this.showPercent = options.showPercent !== false
    this.showSpeed = options.showSpeed !== false
    this.width = options.width || 30
    this.total = options.total
    this.k = 1
  }

  accumulate(expandedTotal: number, phaseWeight: number = 1.0) {
    this.k += (expandedTotal * phaseWeight / this.total / 100)
    this.k = Math.ceil(this.k * 100000) / 100000

    this.current = Math.min(
      this.total - Math.round(this.total / this.k),
      this.total
    )

    this.accumulationMode = true
  }

  update(increment: number = 1): void {
    if (this.accumulationMode) {
      process.stdout.write(this.transform())
      this.accumulationMode = false
      return
    }

    this.current = Math.min(this.current + increment, this.total)
    process.stdout.write(this.transform())

    if (this.current === this.total) {
      process.stdout.write('\n')
    }
  }

  processing(): void {
    while (this.current < this.total) {
      this.update(Math.max(1, Math.floor((this.total - this.current) / 10)))
    }
  }

  transform(): string {
    const percent = this.total > 0 ? this.current / this.total : 0
    const filled = Math.floor(percent * this.width)
    const empty = this.width - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    const now = Date.now()
    const elapsed = (now - this.startTime) / 1000
    const speed = elapsed > 0 ? (this.current / elapsed).toFixed(2) : '0.00'

    let output = `\r[${bar}]`

    if (this.showPercent) {
      output += ` ${(percent * 100).toFixed(1)}%`
    }

    output += ` ${this.current}/${this.total}`

    if (this.showSpeed) {
      output += ` (${speed} items/s)`
    }

    return output
  }
}
