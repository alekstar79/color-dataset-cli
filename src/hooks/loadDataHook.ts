import { HookHandler, ColorData, CommandContext } from '@/types'
import { Parser } from '@/middleware/parser/Parser'
import { Application } from '@/core/Application'

export const loadDataHook: HookHandler = async (
  context: CommandContext,
  app: Application
) => {
  const { args, logger, command } = context
  const schema = (command as any).config?.schema
  const datasetApi = (app as any).dataset

  // Looking for dataset paths according by the command scheme
  const datasetPaths: string[] = []

  if (schema?.args) {
    // Analyzing arguments according to the scheme
    schema.args.forEach((rule: any, index: number) => {
      if (rule.type === 'path' && args[index]) {
        datasetPaths.push(args[index])
      }
    })

    // If the first argument is not dataset, looking for the rest
    if (schema.args[0]?.type !== 'path' && args.length > 1) {
      datasetPaths.push(...args.slice(1).filter(a => !/^\d+$/.test(a)))
    }
  }

  // Uploading all found datasets
  if (datasetPaths.length > 0) {
    logger.info(`📂 Loading ${datasetPaths.length} dataset(s): ${datasetPaths.join(', ')}`)
    context.rawDatasets = {} as Record<string, any>

    for (const path of datasetPaths) {
      try {
        context.rawDatasets[path] = await datasetApi.load(path)
        logger.debug(`  📄 ${path}: ${Array.isArray(context.rawDatasets[path]) ? 'array' : typeof context.rawDatasets[path]}`)

        if (context.rawDatasets) {
          context.parsedDatasets = {} as Record<string, ColorData[]>
          const parser = new Parser()

          for (const [path, rawData] of Object.entries(context.rawDatasets)) {
            try {
              const result = await parser.parseDataset(rawData)
              logger.info(`📄 ${path}: ${result.format} (${Math.round(result.confidence * 100)}%)`)
              context.parsedDatasets[path] = result.colors
              logger.debug(`  ✅ ${path}: ${result.colors.length} colors`)
            } catch (error: any) {
              logger.error(`❌ ${path}: ${error.message}`)
              context.parsedDatasets[path] = []
            }
          }
        }

      } catch (error: any) {
        logger.error(`❌ Failed to load ${path}: ${error.message}`)
      }
    }
  }
}
