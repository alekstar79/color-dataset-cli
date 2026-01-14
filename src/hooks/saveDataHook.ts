import { CommandContext, HookHandler } from '@/types'
import { Application } from '@/core/Application'

export const saveDataHook: HookHandler = async (
  context: CommandContext,
  _app: Application
) => {
  const { args, logger, command, dataset, result, options } = context

  if (!result?.data || !Array.isArray(result.data)) {
    logger.debug('Save Data Hook: No data to save')
    return
  }

  // // 1. FROM ARGUMENTS (MergeCommand: <output> <input1> <input2>)
  // const schema = command.config.schema
  // if (schema?.args?.[0]?.type === 'output' && args[0]) {
  //   const outputPath = args[0]
  //   const format = options?.format || 'ts'
  //
  //   logger.info(`💾 Saving ${result.data.length} colors to ${outputPath}`)
  //   await dataset.save(result.data, outputPath, format, logger)
  //   logger.success(`✅ Saved: ${outputPath}`)
  //   return
  // }
  //
  // // 2. USUAL COMMANDS: <input> <output>
  // let outputPath: string | undefined
  // if (schema?.args?.[1]?.type === 'output' && args[1]) {
  //   outputPath = args[1]
  // }
  // // 3. --output / -o
  // else if (options?.output || options?.o) {
  //   outputPath = options.output || options.o
  // }

  const schema = command.config.schema
  let outputPath: string | undefined

  // LOGIC 1: Looking for the output according to the scheme (args[N].type === 'output')
  if (schema?.args) {
    for (let i = 0; i < schema.args.length; i++) {
      if (schema.args[i].type === 'output' && args[i]) {
        outputPath = args[i]
        break
      }
    }
  }

  // LOGIC 2: --output / -o
  if (!outputPath && (options?.output || options?.o)) {
    outputPath = options.output || options.o
  }

  if (!outputPath) {
    logger.debug('Save Data Hook: output path not found')
    return
  }

  const format = options?.format || 'ts'
  logger.info(`💾 Saving ${result.data.length} colors to ${outputPath}`)

  try {
    await dataset.save(result.data, outputPath, format, logger)
    logger.success(`✅ Saved: ${outputPath}`)
  } catch (error: any) {
    logger.error(`❌ Save failed: ${error.message}`)
  }
}
