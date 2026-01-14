import { Family } from '@/types'

/**
 * Dictionary of words for color families
 */
export const colorKernels: Record<Family, string[]> = {
  red: [
    'crimson', 'scarlet', 'ruby', 'cardinal', 'carmine', 'cherry', 'maroon', 'claret',
    'burgundy', 'vermilion', 'garnet', 'brick red', 'oxblood', 'wine', 'rosewood', 'fire',
    'red', 'brick', 'tomato', 'mahogany', 'coral', 'rose', 'raspberry', 'cerise'
  ],
  orange: [
    'tangerine', 'amber', 'peach', 'apricot', 'paprika', 'saffron', 'ginger', 'copper',
    'persimmon', 'pumpkin', 'cantaloupe', 'cinnamon', 'rust', 'terracotta', 'burnt orange',
    'orange', 'coral', 'carrot', 'mango', 'marigold', 'tiger', 'sunset', 'clay', 'honey'
  ],
  yellow: [
    'lemon', 'gold', 'canary', 'mustard', 'dandelion', 'butter', 'sunflower', 'maize',
    'corn', 'straw', 'flax', 'bumblebee', 'sunshine', 'honey', 'blond', 'banana', 'pineapple',
    'citrine', 'topaz', 'wheat', 'amber', 'saffron', 'marigold'
  ],
  chartreuse: ['chartreuse', 'lime', 'pistachio', 'peridot'],
  green: [
    'emerald', 'jade', 'sage', 'olive', 'fern', 'mint', 'khaki', 'forest', 'moss',
    'seafoam', 'hunter', 'kelly', 'shamrock', 'pine', 'celadon', 'viridian', 'malachite',
    'avocado', 'artichoke', 'basil', 'clover', 'cactus', 'moss green', 'army green',
    'bottle green'
  ],
  springgreen: ['spring', 'mint', 'turquoise', 'aqua'],
  cyan: [
    'cyan', 'sky', 'powder', 'ice', "robin's egg", 'caribbean', 'tiffany blue', 'arctic',
    'babyblue', 'crystal', 'glacier', 'frost', 'winter sky', 'airforce', 'blue'
  ],
  azure: ['azure', 'cobalt', 'cerulean', 'sapphire'],
  blue: [
    'sapphire', 'cerulean', 'cobalt', 'azure', 'steel', 'light blue', 'navy blue',
    'royal blue', 'indigo', 'denim', 'prussian', 'saxe', 'yinmn', 'yinmn blue',
    'periwinkle', 'cornflower', 'oxford', 'midnight', 'phthalo', 'ultramarine',
    'delft', 'space', 'berry'
  ],
  violet: ['violet', 'lavender', 'amethyst', 'orchid'
  ],
  magenta: [
    'magenta', 'fuchsia', 'raspberry', 'cerise', 'shocking pink', 'hot pink', 'deep pink',
    'french rose', 'pink', 'rose', 'ruby', 'raspberry', 'carmine', 'cerise', 'hollywood',
    'bright pink'
  ],
  rose: ['rose', 'blush', 'pink', 'coral'],
  neutral: ['gray', 'charcoal', 'slate', 'silver'],
  lime: [
    'lime', 'chartreuse', 'pistachio', 'peridot', 'spring bud', 'electric lime', 'pear',
    'apple green', 'kiwi', 'neon lime', 'acid green', 'harlequin', 'spring green'
  ],
  teal: [
    'teal', 'turquoise', 'aqua', 'aquamarine', 'peacock', 'cerulean', 'marine', 'pacific',
    'cyan', 'tiffany blue', 'wave', 'lagoon', 'mermaid', 'parrot', 'egyptian blue'
  ],
  purple: [
    'violet', 'lavender', 'plum', 'lilac', 'amethyst', 'orchid', 'mauve', 'heliotrope',
    'grape', 'boysenberry', 'eggplant', 'byzantium', 'pansy', 'iris', 'mulberry', 'wisteria',
    'passion', 'royal purple', 'tyrian', 'jam', 'wine'
  ],
  brown: [
    'umber', 'sienna', 'ghestnut', 'mahogany', 'chocolate', 'auburn', 'taupe', 'beige', 'sand',
    'cocoa', 'mocha', 'caramel', 'cinnamon', 'almond', 'hazel', 'brunette', 'tawny', 'fawn',
    'coffee', 'walnut', 'pecan', 'cedar', 'oak', 'leather', 'cork', 'tan', 'khaki', 'olive'
  ],
  gray: [
    'slate', 'charcoal', 'pewter', 'ashen', 'silver', 'smoke', 'gunmetal', 'ash',
    'battleship', 'nickel', 'platinum', 'iron', 'shadow', 'grey', 'fog', 'mist',
    'stone', 'concrete', 'cement', 'steel', 'tin', 'lead', 'anchor', 'dove'
  ],
  pink: [
    'pink', 'salmon', 'coral', 'blush', 'watermelon', 'flamingo', 'bubblegum', 'peach',
    'rose', 'powder pink', 'tea rose', 'cherry blossom', 'barbie pink', 'carnation',
    'fuchsia', 'magenta', 'rosewood', 'raspberry', 'strawberry', 'cotton candy'
  ],
  black: [
    'black', 'jet', 'ebony', 'onyx', 'raven', 'sable', 'midnight', 'coal', 'obsidian', 'ink',
    'charcoal', 'graphite', 'oil', 'pitch', 'soot', 'void', 'space', 'licorice'
  ],
  white: [
    'white', 'snowy', 'ivory', 'cream', 'pearl', 'alabaster', 'chalk', 'bone',
    'eggshell', 'vanilla', 'cotton', 'lace', 'floral white', 'seashell', 'milk',
    'porcelain', 'lily', 'daisy', 'powder', 'frost', 'salt', 'paper'
  ],
  metallic: [
    'gold', 'silver', 'copper', 'bronze', 'brass', 'platinum', 'steel', 'nickel',
    'chrome', 'iron', 'pewter', 'gunmetal', 'mercury', 'titanium', 'aluminum',
    'rose gold', 'white gold', 'black gold', 'osmium', 'lead', 'tin', 'zinc'
  ],
  pastel: [
    'pastel', 'baby pink', 'baby blue', 'mint cream', 'lavender blush', 'powder blue',
    'peach puff'
  ],
  neon: [
    'neon', 'electric blue', 'electric lime', 'electric purple', 'laser lemon',
    'hot magenta', 'screamin green'
  ],
  earth: [
    'ochre', 'sienna', 'umber', 'khaki', 'olive drab', 'sandstone', 'clay', 'mud',
    'terracotta', 'rust', 'burnt sienna', 'raw umber', 'sepia', 'camel', 'desert sand',
    'dirt', 'soil', 'adobe', 'sand dune', 'canyon', 'mushroom', 'taupe', 'beige'
  ],
  jewel: [
    'ruby', 'emerald', 'sapphire', 'amethyst', 'topaz', 'opal', 'jade', 'pearl',
    'garnet', 'diamond', 'onyx', 'turquoise', 'lapis lazuli', 'peridot', 'aquamarine',
    'citrine', 'tourmaline', 'zircon', 'moonstone', 'alexandrite', 'tanzanite', 'coral'
  ],
  skin: [
    'porcelain', 'alabaster', 'ivory', 'beige', 'tan', 'sand', 'almond', 'peach',
    'caramel', 'cinnamon', 'honey', 'mocha', 'cocoa', 'chestnut', 'mahogany', 'bronze',
    'olive', 'golden', 'pale', 'fair', 'medium', 'dark', 'ebony', 'umber'
  ],
  seasonal: [
    'spring green', 'summer sky', 'autumn leaf', 'winter white', 'harvest gold',
    'frost blue', 'midsummer night', 'april showers', 'october rust', 'december snow',
    'vernal', 'estival', 'autumnal', 'hibernal', 'indian summer', 'january frost'
  ],
  food: [
    'chocolate', 'caramel', 'cinnamon', 'honey', 'mocha', 'cocoa', 'cream', 'vanilla',
    'mint', 'cherry', 'strawberry', 'blueberry', 'matcha', 'pumpkin', 'eggplant',
    'tomato', 'avocado', 'banana', 'lemon', 'lime', 'orange', 'grape', 'watermelon',
    'coffee', 'tea', 'coconut', 'paprika', 'saffron', 'curry', 'wasabi'
  ],
  nature: [
    'forest', 'moss', 'pine', 'olive', 'sage', 'fern', 'seafoam', 'ocean', 'river',
    'sky', 'sunset', 'dawn', 'dusk', 'storm', 'thunder', 'earth', 'clay', 'stone',
    'mountain', 'desert', 'jungle', 'savanna', 'tundra', 'glacier', 'volcano', 'aurora'
  ],
  floral: [
    'rose', 'lilac', 'lavender', 'violet', 'orchid', 'peony', 'daisy', 'sunflower',
    'marigold', 'pansy', 'iris', 'tulip', 'cherry blossom', 'magnolia', 'hydrangea',
    'hibiscus', 'jasmine', 'gardenia', 'carnation', 'daffodil'
  ],
  cosmic: [
    'space', 'galaxy', 'nebula', 'starlight', 'moonlight', 'sunlight', 'aurora',
    'comet', 'meteor', 'planetary', 'solar flare', 'cosmic dust', 'black hole',
    'supernova', 'milky way', 'andromeda'
  ],
  vintage: [
    'sepia', 'antique', 'victorian', 'retro', 'heritage', 'classic', 'timeless',
    'old rose', 'patina', 'distressed', 'faded', 'weathered', 'aged', 'historic'
  ],
  festive: [
    'festive red', 'holiday green', 'christmas gold', 'hanukkah blue', 'diwali orange',
    'easter pink', 'halloween orange', 'valentine red', 'new year', 'new year silver',
    'birthday bright'
  ]
}

/**
 * Categorized modifiers
 */
export const colorModifiers = {
  intensity: [
    'strong', 'medium', 'bold', 'light', 'lighter', 'lightest',
    'dark', 'darker', 'darkest', 'bright', 'brighter', 'brightest'
  ],
  saturation: [
    'saturated', 'desaturated', 'washed', 'tinted', 'shade', 'shaded',
    'vivid', 'pale', 'palest', 'faint', 'faded', 'deep', 'deeper', 'rich',
    'soft', 'pastel', 'clear', 'dull',
  ],
  texture: [
    'silk', 'silky', 'velvet', 'pearl', 'matte', 'gloss', 'glossy',
    'shiny', 'electric', 'neon', 'fluorescent', 'metallic', 'wool',
    'pearlescent', 'crystal', 'iridescent', 'satin', 'linen'
  ],
  temperature: [
    'warm', 'warmer', 'cool', 'cooler', 'hot', 'cold', 'frost'
  ],
  degree: [
    'very', 'ultra', 'super', 'extra', 'most', 'more', 'less',
    'slightly', 'somewhat', 'fairly', 'quite', 'rather'
  ],
  grayish: [
    'gray', 'grey', 'grayish', 'greyish', 'dusty', 'muddy', 'muted', 'dirty'
  ],
  hueish: [
    'almost', 'bluish', 'greenish', 'yellowish', 'purplish', 'reddish',
    'orangeish', 'pinkish', 'brownish'
  ],
  poetic: [
    'ancient', 'celestial', 'cosmic', 'ethereal', 'mystic',
    'primal', 'serene', 'whispering', 'zen', 'dancing', 'golden',
    'silver', 'moonlit', 'sunlit', 'starlit', 'ocean', 'forest'
  ],
  endings: ['color', 'tone', 'hue', 'tint', 'chroma', 'vibrant'],
  dark: ['dark', 'deep', 'midnight', 'navy'],
  light: ['light', 'pale', 'soft', 'pastel'],
  bright: ['bright', 'vivid', 'vibrant', 'hot'],
  dull: ['dull', 'muted', 'dusty', 'faded']
}

/**
 * Well-known compound names for camelCase
 */
export const knownCompounds = [
  'navyblue', 'babyblue', 'steelblue', 'bluegreen', 'redorange',
  'purpleblue', 'greenishyellow', 'olivegreen', 'purplepink',
  'redbrown', 'yellowgreen', 'blueviolet', 'redviolet',
  'blueblack', 'redyellow', 'greenblue', 'orangered', 'yelloworange',
  'greenyellow', 'purplered', 'pinkpurple', 'brownred', 'grayblue',
  'graygreen', 'grayred', 'grayyellow', 'graypink', 'graybrown',
  'graypurple', 'browngray', 'purplegray', 'pinkgray', 'yellowgray',
  'greengray', 'bluegray', 'redgray', 'orangebrown', 'yellowishgreen',
  'greenishblue', 'purplishblue', 'bluishpurple', 'reddishorange',
  'orangishred', 'yellowishorange', 'orangishyellow', 'greenishyellow',
  'yellowishgreen', 'bluishgreen', 'greenishblue', 'purplishred',
  'reddishpurple', 'pinkishpurple', 'purplishpink', 'brownishred',
  'reddishbrown', 'grayishblue', 'blueishgray', 'grayishgreen',
  'greenishgray', 'grayishred', 'reddishgray', 'grayishyellow',
  'yellowishgray', 'grayishpurple', 'purplishgray', 'grayishpink',
  'pinkishgray', 'grayishbrown', 'brownishgray', 'airforceblue',
  'alizarincrimson', 'amaranthlight', 'amaranthmagenta', 'amaranthpink',
  'amaranthpurple', 'americanrose', 'anthracitegray', 'antiquewhite',
  'apricotcrayola', 'aquamarinecrayola', 'armygreen', 'grayishgreen',
  'ashgray', 'atomictangerine', 'azureblue', 'azuresky', 'basaltgray',
  'beigebrown', 'beigegray', 'beigered', 'bluebell', 'bluecrayola',
  'bondiblue', 'bottlegreen', 'brickred', 'brilliantblue', 'brilliantgreen',
  'cadetblue', 'cadetbluecrayola', 'cadmiumgreen', 'camouflagegreen',
  'candypink', 'capriblue', 'caribbeangreen', 'carminepink', 'carminered',
  'carrotorange', 'cerulean', 'chestnutbrown', 'chinesered', 'claybrown',
  'cobaltblue', 'coralred', 'cornflowerblue', 'cornyellow', 'dahliayellow',
  'darkimperialblue', 'darkmidnightblue', 'darkslategray', 'dartmouthgreen',
  'deepamaranth', 'deepcarmine', 'deepfuchsia', 'diamondblue', 'dodgerblue',
  'dogwoodrose', 'dustygray', 'electricblue', 'emeraldgreen', 'ferngreen',
  'ferrarired', 'fieryredorange', 'firegreen', 'firemagenta', 'fireorange',
  'firered', 'firesienna', 'fluorescentbright', 'forestgreen', 'fuchsiapink',
  'gentianblue', 'ghostwhite', 'goldcrayola', 'goldenbirch', 'goldenchestnut',
  'goldenrod', 'graphiteblack', 'graphitegrey', 'grayishblue', 'grayishbrown',
  'grayisholive', 'grayishpurple', 'grayishred', 'grayishviolet',
  'greenbluecrayola', 'greencrayola', 'greenyellowcrayola', 'greyasparagus',
  'greybeige', 'greyconcrete', 'greykhaki', 'greyolive', 'greysilk',
  'heatherpurple', 'honeyyellow', 'huntergreen', 'indiagreen', 'indianred',
  'indigocrayola', 'infrared', 'internationalkleinblue', 'internationalorange',
  'junglegreen', 'kellygreen', 'laserlemon', 'lavenderblue', 'lavenderblush',
  'lavendercrayola', 'lavenderrose', 'lawngreen', 'leafygreen', 'leafygreencrayola',
  'lemonchiffon', 'lemonlime', 'lemonyellow', 'lemonyellowcrayola', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgreen', 'lightpink', 'lightseagreen',
  'lightskyblue', 'lightslategrey', 'lightsteelblue', 'lightturquoise',
  'lightyellow', 'limegreen', 'magentacrayola', 'magicmint', 'mangotango',
  'maygreen', 'melonyellow', 'midnightblue', 'midnightgreen', 'mignonettegreen',
  'mintcream', 'mintgreen', 'mintturquoise', 'mossgreen', 'mountbattenpink',
  'mousegrey', 'narcissusyellow', 'navajowhite', 'nightblue', 'oceanblue',
  'ochrebrown', 'olivedrab', 'olivegreencrayola', 'opalgreen', 'orangepeach',
  'orangeyellow', 'orientred', 'oxidered', 'palecornflower', 'palegoldenrod',
  'palegreen', 'palelavender', 'palemagenta', 'palepink', 'palepurple',
  'palesilver', 'palespringbud', 'paleturquoise', 'palevioletred', 'paleyellow',
  'pastelblue', 'pastelgreen', 'pastelorange', 'pastelpink', 'pastelturquoise',
  'pastelyellow', 'patinagreen', 'peachcrayola', 'peachyellow', 'peargreen',
  'pearlcardinal', 'persianblue', 'persiangreen', 'persianindigo', 'persianred',
  'persianrose', 'pigeonblue', 'piggypink', 'pigmentedgreen', 'pinegreen',
  'pinegreencrayola', 'pinkcarnation', 'poppyred', 'powderblue', 'prussianblue',
  'purpleheart', 'purplemountain', 'purplepizza', 'quartzgray', 'rapeseedyellow',
  'raspberryred', 'raspberryrose', 'rawumber', 'redcrayola', 'redorangecrayola',
  'redvioletcrayola', 'roseebony', 'rosegold', 'rosequartz', 'rosevale',
  'rosybrown', 'royalblue', 'royalpurple', 'rubyred', 'saddlebrown',
  'salmoncrayola', 'salmonorange', 'salmonred', 'sandybrown', 'sandyyellow',
  'sapgreen', 'sapphireblue', 'scarlet', 'screaminggreen', 'seagreen',
  'seagreencrayola', 'sealbrown', 'selectiveyellow', 'shamrockgreen',
  'silkcrayola', 'silvergray', 'skyblue', 'slateblue', 'springgreen',
  'springgreencrayola', 'stonegrey', 'strawberryred', 'swampgreen',
  'tangerinetango', 'tarpaulingray', 'teagreen', 'ticklemepink', 'turquoiseblue',
  'turquoisegreen', 'unmellowyellow', 'velvetbeige', 'velvetcream', 'velvetsand',
  'velvettaupe', 'vibrantorangepeel', 'walnutbrown', 'waterblue', 'wettropicalforest',
  'whitealuminum', 'whitegreen', 'wildblueyonder', 'yellowbroom', 'yellowcrayola',
  'yellowcurry', 'yellowgold', 'yellowgreencrayola', 'yellowivory', 'yellowochre',
  'yelloworangecrayola', 'yellowsulfur'
]

export const colorDescriptors = {
  nature: [
    'dawn', 'dusk', 'mist', 'glow', 'bloom', 'veil', 'haze',
    'spark', 'drift', 'wave', 'flame', 'frost', 'shadow', 'light',
    'sun', 'moon', 'star', 'sky', 'sea', 'ocean', 'river',
    'stone', 'rock', 'sand', 'leaf', 'forest', 'field'
  ],
  places: [
    'meadow', 'mountain', 'valley', 'desert', 'jungle', 'canyon',
    'glacier', 'volcano', 'aurora', 'galaxy', 'nebula'
  ],
  emotions: [
    'joy', 'calm', 'peace', 'energy', 'passion', 'serenity',
    'mystery', 'dream', 'magic', 'echo', 'whisper', 'sigh'
  ],
  endings: [
    'like', 'tone', 'shade', 'tint', 'hue', 'color', 'colour'
  ],
  crayola: [
    'crayola', 'crayolablue', 'crayolagreen', 'crayolapink'
  ],
  other: [
    'based', 'web', 'traditional'
  ]
}
