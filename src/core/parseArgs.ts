import { ParsedArgs } from '@/types'

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = []
  const named: Record<string, string> = {}
  const options: Record<string, any> = {}
  const flags: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    // --format=ts or --format ts
    if (arg.startsWith('--')) {
      const [key] = arg.slice(2).split('=')
      const cleanKey = key.replace(/-/g, '')
      if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        options[cleanKey] = argv[++i]
      } else {
        options[cleanKey] = true
      }
      continue
    }

    // Short flags: -v, -trace
    if (arg.startsWith('-') && arg.length > 1) {
      flags.push(arg.slice(1))
      continue
    }

    // Named: dataset=src/dataset.ts
    if (arg.includes('=')) {
      const [key, value] = arg.split('=', 2)
      named[key.replace(/-/g, '')] = value
      continue
    }

    // -o unique.ts (special case)
    if (arg === '-o' && i + 1 < argv.length) {
      named.output = argv[++i]
      continue
    }

    // Positional arguments
    positional.push(arg)
  }

  // Backwards compatibility: commandName + args
  const commandName = positional[0] || null
  const args = positional.slice(1)

  // Distributing named in args using the deduplicate scheme
  if (positional[0] === 'deduplicate') {
    if (named.dataset) args.unshift(named.dataset)
    if (named.output) args.push(named.output)
  }

  return {
    commandName,
    args, // ["src/dataset.ts", "unique.ts"]
    options, // { format: "ts" }
    flags // ["v"]
  } as ParsedArgs
}
