import { CommandContext, MiddlewareHandler, ValidationSchema } from '@/types'

export function validationMiddleware(): MiddlewareHandler {
  return async (ctx: CommandContext, next: () => Promise<void>) => {
    const { command, args, options, logger } = ctx
    const errors: string[] = []

    // Reading schema from the command (config.schema)
    const schema: ValidationSchema = (command as any).config?.schema || {}

    // Validation of arguments
    if (schema.args) {
      schema.args.forEach((rule, index) => {
        if (rule.required && !args[index]) {
          errors.push(`❌ Missing required argument: "${rule.name}"`)
        }
        if (rule.type === 'number' && args[index] && isNaN(Number(args[index]))) {
          errors.push(`❌ Argument "${rule.name}" must be a number`)
        }
        if (rule.type === 'path' && args[index] && !args[index].match(/\.(ts|js|json)$/)) {
          errors.push(`❌ "${rule.name}" must be a file (.ts/.js/.json)`)
        }
        if (rule.type === 'output' && args[index]) {
          // output can be any
        }
      })
    }

    // Validation of options
    if (schema.options) {
      Object.entries(schema.options).forEach(([key, rule]) => {
        if (rule.required && options[key] === undefined) {
          errors.push(`❌ Option required: --${key}`)
        }
        if (rule.type === 'number' && options[key] !== undefined && isNaN(Number(options[key]))) {
          errors.push(`❌ The --${key} option must be a number`)
        }
      })
    }

    if (errors.length > 0) {
      logger.error('🚫 Validation errors:')
      errors.forEach(err => logger.error(`  ${err}`))
      logger.info(`💡 ${command.name} ${command.signature}`)
      throw new Error('Invalid command parameters')
    }

    await next()
  }
}
