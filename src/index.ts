#!/usr/bin/env node

import { validationMiddleware } from './middleware/validationMiddleware'
import { parserMiddleware } from './middleware/parserMiddleware'
import { loadDataHook } from './hooks/loadDataHook'
import { saveDataHook } from './hooks/saveDataHook'

import { DatasetPlugin } from './plugins/DatasetPlugin'
import { Application } from './core/Application'

import { AnalyzeCommand } from './commands/AnalyzeCommand'
import { CapitalizeCommand } from './commands/CapitalizeCommand'
import { CopyCommand } from './commands/CopyCommand'
import { DeduplicateCommand } from './commands/DeduplicateCommand'
import { HueGenerateCommand } from './commands/HueGenerateCommand'
import { MergeCommand } from './commands/MergeCommand'
import { NormalizeCommand } from './commands/NormalizeCommand'
import { NormalizeNameCommand } from './commands/NormalizeNameCommand'
import { PriorityMergeCommand } from './commands/PriorityMergeCommand'
import { RecalcCommand } from './commands/RecalcCommand'
import { SmartGenerateCommand } from './commands/SmartGenerateCommand'
import { SortCommand } from './commands/SortCommand'

const app = new Application('ColorDatasetCli', '1.0.0')

// 1. Plugins
app.registerPlugin('dataset', new DatasetPlugin())

// 2. Middlewares
app.use(validationMiddleware())       // 1. Validation of the command schema
app.use(parserMiddleware())           // 2. Parsing rawData → parsedData

// 3. Hooks
app.hook('preExecute',  loadDataHook)  // 3. Uploading rawData
app.hook('postExecute', saveDataHook)  // 4. Saving the result

app.registerCommand(new AnalyzeCommand())
app.registerCommand(new CapitalizeCommand())
app.registerCommand(new CopyCommand())
app.registerCommand(new DeduplicateCommand())
app.registerCommand(new HueGenerateCommand())
app.registerCommand(new MergeCommand())
app.registerCommand(new NormalizeCommand())
app.registerCommand(new NormalizeNameCommand())
app.registerCommand(new PriorityMergeCommand())
app.registerCommand(new RecalcCommand())
app.registerCommand(new SmartGenerateCommand())
app.registerCommand(new SortCommand())

await app.run()
