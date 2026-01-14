import { CommandContext, CommandAction, CommandConfig } from '@/types'
import { Logger } from '../utils/Logger.ts'

type HookCallback = (context: any) => Promise<void>
type ValidatorCallback = (context: any) => true | string

export class Command {
  name: string
  signature: string
  description: string
  config: Required<CommandConfig>
  readonly action: CommandAction
  private options: Array<{
    flags: string
    description: string
    defaultValue?: any
    validator?: (value: any) => boolean
  }> = []
  private validators: ValidatorCallback[] = []
  private hooks: {
    before: HookCallback[]
    after: HookCallback[]
    error: HookCallback[]
  } = {
    before: [],
    after: [],
    error: []
  }

  constructor(
    name: string,
    signature: string,
    description: string,
    action: CommandAction,
    config: CommandConfig = {}
  ) {
    this.name = name
    this.signature = signature
    this.description = description
    this.action = action
    this.config = {
      allowUnknownOptions: config.allowUnknownOptions ?? false,
      strict: config.strict ?? true,
      schema: config.schema
    } as Required<CommandConfig>
  }

  option(
    flags: string,
    description: string,
    defaultValue?: any,
    validator?: (value: any) => boolean
  ): this {
    this.options.push({ flags, description, defaultValue, validator })
    return this
  }

  validate(validator: ValidatorCallback): this {
    this.validators.push(validator)
    return this
  }

  before(hook: HookCallback): this {
    this.hooks.before.push(hook)
    return this
  }

  after(hook: HookCallback): this {
    this.hooks.after.push(hook)
    return this
  }

  onError(hook: HookCallback): this {
    this.hooks.error.push(hook)
    return this
  }

  async execute(
    args: string[],
    options: Record<string, any>,
    flags: string[],
    context: CommandContext
  ): Promise<any> {
    try {
      for (const hook of this.hooks.before) {
        await hook({ args, options, flags, context })
      }

      for (const validator of this.validators) {
        const result = validator({ args, options, flags })
        if (result !== true) {
          throw new Error(result || `Validation error for command ${this.name}`)
        }
      }

      const result = await this.action(args, options, flags, context)
      context.result = result

      for (const hook of this.hooks.after) {
        await hook({ args, options, flags, result, context })
      }

      return result
    } catch (error) {
      for (const hook of this.hooks.error) {
        await hook({ error, args, options, flags, context })
      }
      throw error
    }
  }

  showHelp(): void {
    const logger = new Logger()
    logger.info(`\n${logger.colorize(this.description, 'cyan')}`)
    logger.info(`Using: ${this.name} ${this.signature}`)

    if (this.options.length > 0) {
      logger.info('\nOptions:')
      for (const opt of this.options) {
        logger.info(`  ${opt.flags.padEnd(25)} ${opt.description}`)
      }
    }
  }
}
