import { PipeHandler } from '@/utils/PipeHandler'
import { Application } from '@/core/Application'
import { Command } from '@/core/Command'
import { Logger } from '@/utils/Logger'
import { Tracer } from '@/utils/Tracer'

export type FixedSizeArray<T, N extends number, R extends T[]> =
  R['length'] extends N ? R : FixedSizeArray<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = N extends N
  ? FixedSizeArray<T, N, []>
  : never;

export interface ParsedArgs {
  commandName: string | null;
  args: string[];
  options: Record<string, any>;
  flags: string[];
  named: Record<string, string>;
}

export interface ColorData {
  hex: string;
  name: string;
  family?: string;
  category?: string;
  hueRange: Tuple<number, 2>;
  rgb: Tuple<number, 3>;
  hsl: { h: number; s: number; l: number };
  originalName: string;
  [key: string]: any;
}

export interface DatasetAPI {
  load: (path: string) => Promise<ColorData[]>;
  save: (data: ColorData[], path: string, format?: string, logger?: any) => Promise<void>;
  validate: (data: ColorData[]) => ColorData[];
}

export interface ParseResult {
  format: string;
  colors: ColorData[];
  confidence: number;
  metadata: Record<string, any>;
  performance: {
    detectionMs: number;
    parsingMs: number;
  };
}

export interface ASTStructure {
  type: 'pairs' | 'object' | 'objects' | 'json' | 'color-palette' | 'structured' | 'unknown';
  confidence: number;
  metadata: Record<string, any>;
  schema: any;
}

export interface Metadata {
  format: string;
  confidence: number;
  colorsCount: number;
}

export interface CommandContext {
  command: Command;
  options: Record<string, any>;
  args: string[];
  flags: string[];
  logger: Logger;
  tracer: Tracer;
  pipe: PipeHandler;
  app: Application & { dataset: DatasetAPI };
  dataset: DatasetAPI;
  rawDatasets?: Record<string, any>              // { "ds1.ts": raw1, "ds2.ts": raw2 }
  parsedDatasets?: Record<string, ColorData[]>   // { "ds1.ts": colors1, "ds2.ts": colors2 }
  parseMetadata?: Record<string, Metadata>
  result?: any;
  [key: string]: any;
}

export interface CommandConfig {
  schema?: ValidationSchema;
  allowUnknownOptions?: boolean;
  strict?: boolean;
}

export interface CapitalizeResult {
  original: number;
  capitalized: number;
  data: ColorData[];
}

export interface CapitalizeResultExtended extends CapitalizeResult {
  transformStats?: {
    dashTransformed: number
    camelTransformed: number
    spaceNormalized: number
    unchanged: number
    totalOperations: number
  }
}

export interface CopyStats {
  total: number
  copied: number
  errors: number
}

export interface CopyResult {
  stats: CopyStats
  data: ColorData[]
}

export interface DatasetStats {
  nameLength: {
    avg: number;
    min: number;
    max: number;
  };
  hexUsage: {
    '3-digit': number;
    '6-digit': number;
  };
  nameWords: {
    avgWords: number;
    avgWordLength: number;
  };
}

export interface DuplicateGroup {
  hex: string;
  names: string[];
  selected: string;
  reason: string;
}

export interface DeduplicateStats {
  original: number;
  unique: number;
  removed: number;
  removalRate: string;
}

export interface DeduplicateResult {
  data: ColorData[];
  colors?: ColorData[];
  stats: DeduplicateStats;
  duplicates: DuplicateGroup[];
}

interface DuplicatesStats {
  hexDuplicates: number;
  nameDuplicates: number;
  exactDuplicates: number;
  uniqueHex: number;
  uniqueNames: number;
}

export interface TopStats {
  longestNames: string[];
  shortestNames: string[];
  mostCommonWords: string[];
}

export interface Distributions {
  nameLengthBuckets: Record<string, number>;
  hexGroups: Record<string, number>;
}

export interface Patterns {
  hasNumbers: number;
  hasSpecialChars: number;
  camelCase: number;
  allLower: number;
  allUpper: number;
}

export interface AnalyzeResult {
  total: number;
  valid: number;
  invalid: number;
  duplicates: DuplicatesStats;
  stats: DatasetStats;
  top: TopStats;
  distributions: Distributions;
  patterns: Patterns;
}

export interface MergeResult {
  data: ColorData[];
  colors?: ColorData[];
  stats: DeduplicateStats[] | never[];
  inputCount: number;
}

export interface NormalizeStats {
  totalColors: number;
  rgbProcessed: number;
  rgbSkipped: number;
  hslProcessed: number;
  hslSkipped: number;
  normalized: number;
  denormalized: number;
}

export interface NormalizeResult {
  stats: NormalizeStats;
  data: ColorData[];
}

export interface NameAnalysis {
  isClean: boolean;
  isChanged: boolean;
  original: string;
  normalized: string;
  finalName: string;
  tokens: string[];
  baseTokens: string[];
  modifiers: string[];
  descriptors: string[];
  descriptorsRemoved: number;
  wordCount: number;
  hasCamelCase: boolean;
  confidence: number;
}

export interface NameNormalizeStats {
  total: number;
  changed: number;
  clean: number;
  tooLong: number;
  camelCase: number;
  descriptorsRemoved: number;
  duplicateConflicts: number;
  fallbackUsed: number;
  repeatedWordsRemoved: number;
}

export interface RecalcStats {
  total: number;
  recalculated: {
    rgb: number;
    hsl: number;
    hueRange: number;
  };
  errors: number;
}

export interface RecalcResult {
  stats: RecalcStats;
  data: ColorData[];
}

export interface SortStats {
  original: number;
  sorted: number;
  field: 'name' | 'hex' | 'hue';
  reverse: boolean;
  uniqueValues: number;
}

export interface SortResult {
  data: ColorData[];
  stats: SortStats;
}

export interface ValidationSchema {
  args?: Array<{ name: string; required?: boolean; type?: 'path' | 'output' | 'number' }>;
  options?: Record<string, { required?: boolean; type?: string }>;
}

export type HookHandler = (context: CommandContext, app: Application) => Promise<void>
export type MiddlewareHandler = (context: CommandContext, next: () => Promise<void>) => Promise<void>
export type CommandAction = (
  args: string[],
  options: Record<string, any>,
  flags: string[],
  context: CommandContext
) => Promise<any>;

export interface PluginAPI {
  use: (middleware: MiddlewareHandler) => Application;
  registerCommand: (
    name: string,
    signature: string,
    description: string,
    action: CommandAction,
    config?: CommandConfig
  ) => Command;
  logger: Logger;
  tracer: Tracer;
}
