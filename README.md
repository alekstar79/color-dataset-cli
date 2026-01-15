# Color Dataset CLI

> TypeScript CLI for intelligent color dataset generation, pruning, and management with spectral preservation and quality optimization.

[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-18%2B-green?style=flat-square)](https://nodejs.org)

## 🎯 Overview

Color Dataset CLI is a specialized command-line tool for managing, generating, and optimizing color datasets with intelligent algorithms designed to maintain spectral coverage and color family representation. Perfect for design systems, color palette generation, and color space research.

**Key Features:**
- 🧬 **Smart Generation**: 5-phase structured distribution with 34+ color families
- ✂️ **Intelligent Pruning**: Remove low-quality colors while preserving spectral coverage
- 📊 **Quality Metrics**: Advanced scoring based on uniqueness, saturation, and representation
- 🎨 **Color Space Support**: HSL, RGB, Hex with precise conversions
- ⚡ **Zero Dependencies**: Lightweight and fast
- 📈 **Progress Tracking**: Real-time visual feedback with detailed logging
- 🔧 **Type-Safe**: Full TypeScript support with comprehensive type definitions

## 📦 Installation

### From Source

```bash
git clone https://github.com/alekstar79/application-cli.git
cd application-cli
npm install
npm run build
npm start --help
```

---

## 📖 Commands

This CLI provides specialized commands for working with datasets:

- `analyze` – analyze an existing dataset and print statistics, distributions, and potential issues.
- `capitalize` – normalize color names to a consistent capitalized format.
- `copy` – copy a dataset to a new file, optionally with filtering or transformation.
- `deduplicate` – remove duplicate colors based on value and/or name matching.
- `hue-generate` – generate colors evenly distributed by hue angle.
- `merge` – merge multiple datasets into a single one without priority rules.
- `normalize` – normalize color values and structure to the standard dataset format.
- `normalize-name` – normalize and clean color names according to naming rules.
- `priority-merge` – merge multiple datasets using explicit priority rules.
- `prune` – reduce a dataset size by quality‑based selection (already described above).
- `recalc` – recalculate derived fields (HSL/OKLab/etc.) for an existing dataset.
- `smart-generate` – generation of an intelligent dataset with optimal coverage of families
- `sort` – sort a dataset by configurable criteria (hue, lightness, name, etc.).

### Syntax

`analyze`

Options:
```text
-o, --output <path>: Output analysis file (json)  
--console: Show detailed analysis in console (default)  
```

Example:
```bash
cli analyze colors.ts
```

Output includes:
   
- Total color count
- Color family distribution
- Hue coverage analysis
- RGB/HSL value ranges
- Duplicate detection

`capitalize`

Options:
```
-o, --output <path>: Output dataset file  
--format <format>: Output format (ts|js|json) ts by default  
--smart: Smart capitalize (dash-case → spaces)  
--strict Only Title Case without dash  
```

Example:
```bash
cli capitalize colors.ts colors-capitalized.ts
```

`copy`

Options:
```
-o, --output <path>: Output dataset file  
--no-smart: Disable smart processing  
--capitalize-only: Only capitalize  
```

Example:
```bash
cli copy colors.ts subset.js --capitalize-only
```

`deduplicate`

Options:  
```
-o, --output <path>: Output deduplicated dataset  
--report: Show a detailed report  
--save-report <path>: Save the report  
```

Example:
```bash
cli deduplicate colors.js --report
```

`hue-generate`

Options:
```
-o, --output <path>: Output dataset file
--saturation <value>: Saturation (10-100) 85 by default
--lightness <value>: Brightness (10-90) 50 by default
--hue-steps <value>: Hue step (1-30) 3 by default
--sat-spread <value>: Saturation spread (±) 15
--light-spread <value>: Brightness spread (±) 20
```

Example:
```bash
cli hue-generate spectrum.js 1200 --saturation=80 --lightness=60
```

`merge`

Options:
```
-o, --output <path>: Output merged dataset
--capitalize: Forceful capitalization (default)
--dedupe: Forceful deduplication (default)
```

Example:
```bash
cli merge -o all-colors.js blues.js greens.js reds.js
```

`normalize`

Options:
```
-o, --output <path>: Output normalized dataset
--format <format>: Format (json|ts) ts by default
--normalize, -n Normalize → [0-1] (default)
--denormalize, -d Denormalize [0-1] → [0-255/360]
--rgb RGB properties only
--hsl HSL properties only
--all All properties (default)
```

Example:
```bash
cli normalize raw-colors.js normalized.js --rgb-normalize
```

`normalize-name`

Options:
```
-o, --output <path>: Output dataset with normalized names
--format <format>: Format (json|ts) ts by default
--report: Detailed report
--dry-run: Analysis only
--smart: Smart capitalize true by default
--no-smart: Disable smart capitalize
```

Example:
```bash
cli normalize-name colors.js colors-normalized.ts --smart false
```

`priority-merge`

Options:
```
-o, --output <path>: Output merged dataset
--priority <paths...>: Dataset files in priority order (highest first)
--rules <path>: Priority rules configuration
--conflict <strategy>: Conflict resolution strategy (keep-highest, blend, reject)
```

Example:
```bash
cli priority-merge --priority brand.js base.js -o final.js
```

`prune`

Options:
```
-o, --output <path>: Output pruned dataset
--min-families <value>: Minimum families to preserve (20 by default)
--min-coverage <value>: Minimum spectrum coverage % (0-100) 85 by default
--preserve-extremes: Preserve extreme hue/saturation/lightness values (true by default)
```

Example:
```bash
cli prune large-dataset.js pruned-dataset.ts 2000
```

`recalc`

Options:
```
-o, --output <path>: Output recalculated dataset
--format <format>: Формат (json|ts) ts by default
--denormalize, -d: Денормализовать
--family: Forced redefinition of the family
```

Example:
```bash
cli recalc colors.js updated.js --family
```

`smart-generate`

Options:
```
-o, --output <path>: Output dataset file
--phases <value>: Number of generation phases (1-5) 3 default
--tolerance <value>: Balancing tolerance % (10-50) 30 default
```

Example:
```bash
cli smart-generate smart-palette.js 1000 --phases 5
```

`sort`

Options:
```
-o, --output <path>: Output sorted dataset
--format <format>', 'Format (json|ts)', ts
--by <field>: Sorting field: name|hex|hue (hex by default)
--reverse, -r: Reverse order
--stable: Stable sorting (default)
```

Example:
```bash
cli sort colors.js sorted.js --by hue
```

---

## 🎨 Color Families (34 Total)

The system recognizes 34 distinct color families:

| Primary | Secondary | Tertiary | Special |
|---------|-----------|----------|---------|
| red     | orange    | yellow   | lime    |
| green   | cyan      | azure    | blue    |
| violet  | magenta   | rose     | neutral |
| gray    | black     | white    | pastel  |
| neon    | jewel     | earth    | brown   |
| pink    | skin      | teal     | purple  |
| vintage | cosmic    |          |         |

Each family has its own hue, saturation, and lightness ranges for accurate classification.

---

## 🛠️ Utility Reference

### Utility Classes

#### `DatasetDistribution`

Generates structured color datasets.

```typescript
import { DatasetDistribution } from 'src/utils/dataset-distribution/DatasetDistribution'

const distribution = new DatasetDistribution(10000)
const colors = distribution.generateStructuredDataset(logger)
```

#### `DatasetPruner`

Intelligently prunes datasets.

```typescript
import { DatasetPruner } from 'src/utils/dataset-distribution/DatasetPruner'

const pruner = new DatasetPruner()
const { data, stats } = pruner.prune(colors, 3000, logger, {
  minFamilies: 25,
  minCoverage: 0.85,
  preserveExtremes: true
})
```

#### `SpectrumAnalyzer`

Analyzes color distribution across spectrum.

```typescript
import { SpectrumAnalyzer } from 'src/utils/dataset-distribution/SpectrumAnalyzer'

const analyzer = new SpectrumAnalyzer()
const coverage = analyzer.analyzeCoverage(colors)
const gaps = analyzer.getCriticalBuckets(coverage)
```

#### `QualityScorer`

Evaluates individual color quality.

```typescript
import { QualityScorer } from 'src/utils/dataset-distribution/QualityScorer'

const scorer = new QualityScorer()
const metrics = scorer.scoreColor(color, nearbyColors, familyColors, ranges)
```

#### `FamilyCoverageAnalyzer`

Validates dataset quality metrics.

```typescript
import { FamilyCoverageAnalyzer } from 'src//utils/dataset-distribution/FamilyCoverageAnalyzer'

const validator = new FamilyCoverageAnalyzer()
const { families, coverage, quality } = validator.validate(colors, logger)
```

---

## ⚙️ Configuration

### TypeScript Configuration

The project uses strict TypeScript settings. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

### Environmental Variables

Currently, the CLI doesn't require environment variables. Configuration is done via CLI flags.

---

## 📈 Performance

### Benchmarks

Tested on Intel i7-11700K with 16GB RAM:

| Operation | Dataset Size    | Time  | Memory |
|-----------|-----------------|-------|--------|
| Generate  | 10,000          | 1.2s  | 45MB   |
| Generate  | 50,000          | 6.1s  | 180MB  |
| Prune     | 10,000 → 3,000  | 2.3s  | 65MB   |
| Prune     | 50,000 → 10,000 | 12.4s | 220MB  |
| Validate  | 10,000          | 0.8s  | 30MB   |

### Optimization Tips

1. **For Large Datasets**: Use pruning in stages
   ```bash
   color-dataset prune large.ts medium.ts 25000
   color-dataset prune medium.ts small.ts 5000
   ```

2. **Memory-Limited Environments**: Process in smaller batches
   ```bash
   color-dataset smart-generate batch1.ts 5000
   color-dataset smart-generate batch2.ts 5000
   ```

3. **Quality-First Approach**: Lower target count for higher average scores
   ```bash
   # Higher quality, smaller dataset
   color-dataset smart-generate high-quality.ts 1000
   ```

---

## 🐛 Troubleshooting

### "Dataset not found"

**Problem**: Input dataset file doesn't exist or isn't loaded.

**Solution**:
```bash
# Ensure file path is correct
color-dataset prune ./datasets/input.ts output.ts 1000

# Or generate first
color-dataset smart-generate input.ts 10000
color-dataset prune input.ts output.ts 3000
```

### "Not enough families preserved"

**Problem**: Pruning removes too many color families.

**Solution**:
```bash
# Reduce target count
color-dataset prune input.ts output.ts 5000 --min-families 20

# Or increase min-coverage
color-dataset prune input.ts output.ts 3000 --min-coverage 80
```

### "Quality score is low"

**Problem**: Generated colors have low average quality (< 50/100).

**Solution**:
1. Use smaller target count for higher concentration
2. Increase tolerance for better balancing
3. Specify more phases for better distribution

```bash
color-dataset smart-generate output.ts 5000 --phases 5 --tolerance 40
```

### "Out of memory"

**Problem**: Large datasets exceed available memory.

**Solution**:
1. Process in smaller batches
2. Prune in stages
3. Increase Node.js heap size

```bash
NODE_OPTIONS="--max-old-space-size=4096" color-dataset smart-generate large.ts 100000
```

---

## 🔧 Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/alekstar79/application-cli.git
cd application-cli

# Install dependencies
npm install

# Build project
npm run build

# Run with tsx (hot reload)
npm run dev smart-generate output.ts 1000

# Type check
npm run lint

# Format code
npm run format
```

### Adding New Commands

1. Create command class extending `Command`:

```typescript
// src/commands/MyCommand.ts
import { Command } from '../core/Command'

export class MyCommand extends Command {
  constructor() {
    super('my-command', '<arg>', 'Description', this.perform.bind(this))
  }

  async perform(ctx: CommandContext): Promise<GenerateResult> {
    // Implementation
    return { success: true, errors: 0 }
  }
}
```

2. Register in `src/index.ts`:

```typescript
app.registerCommand(new MyCommand())
```

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Color science references from [W3C CSS Color Module](https://www.w3.org/TR/css-color-3/)
- HSL color space specifications
- Inspired by design system color management best practices

---

## 🚀 Roadmap

See [CHANGELOG.md](CHANGELOG.md) for planned features and improvements.

### Next Releases

- **v1.1.0**: CSV/JSON export, batch processing, OKLAB support
- **v1.2.0**: Web dashboard, interactive editor, dataset comparison tools
- **v2.0.0**: Plugin system, remote sync, ML-based quality scoring

---

## 📊 Statistics

- 📦 **Zero Dependencies**: Lightweight and fast
- 🧮 **34 Color Families**: Comprehensive coverage
- 📈 **5-Phase Generation**: Intelligent distribution
- ✂️ **4-Phase Pruning**: Quality-preserving reduction
- ⚡ **O(n log n)**: Optimized algorithms
- 📝 **Full TypeScript**: Type-safe codebase

---

<div align="center">

Made by [alekstar79](https://github.com/alekstar79)

</div>
