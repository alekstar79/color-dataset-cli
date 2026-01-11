import { CommandContext, HookHandler } from '@/types'
import { Application } from '@/core/Application'

export const saveDataHook: HookHandler = async (
  context: CommandContext,
  _app: Application
) => {
  const { args, logger, command, dataset, result, options } = context

  if (!result?.data || !Array.isArray(result.data)) {
    logger.debug('Save Data Hook: нет данных для сохранения')
    return
  }

  // 1. ИЗ АРГУМЕНТОВ (MergeCommand: <output> <input1> <input2>)
  const schema = command.config.schema
  if (schema?.args?.[0]?.type === 'output' && args[0]) {
    const outputPath = args[0]
    const format = options?.format || 'ts'

    logger.info(`💾 Saving ${result.data.length} colors to ${outputPath}`)
    await dataset.save(result.data, outputPath, format, logger)
    logger.success(`✅ Saved: ${outputPath}`)
    return
  }

  // 2. ОБЫЧНЫЕ КОМАНДЫ: <input> <output>
  let outputPath: string | undefined
  if (schema?.args?.[1]?.type === 'output' && args[1]) {
    outputPath = args[1]
  }
  // 3. --output / -o
  else if (options?.output || options?.o) {
    outputPath = options.output || options.o
  }

  if (!outputPath) {
    logger.debug('Save Data Hook: output путь не найден')
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
