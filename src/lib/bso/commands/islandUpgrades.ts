import { Bank } from 'oldschooljs';

export type UpgradeCategory =
	| 'boss' | 'megaboss' | 'minigame' | 'gathering' | 'prismare'
	| 'fishing' | 'mining' | 'woodcutting' | 'divination' | 'farming';

export type AssignableCategory = Exclude<UpgradeCategory, 'megaboss' | 'prismare'>;

export type SkillCategory = 'fishing' | 'mining' | 'woodcutting' | 'divination' | 'farming';

export const SKILL_CATEGORIES: SkillCategory[] = ['fishing', 'mining', 'woodcutting', 'divination', 'farming'];

export const ASSIGNABLE_CATEGORIES: AssignableCategory[] = [
	'boss', 'minigame', 'gathering',
	'fishing', 'mining', 'woodcutting', 'divination', 'farming',
];

export const ASSIGNMENT_BOOST   = 1.30;
export const ASSIGNMENT_PENALTY = 0.80;

export const ASSIGNMENT_TRIP_COSTS: Record<AssignableCategory, number> = {
	boss:        50,
	minigame:    10,
	gathering:   75,
	fishing:     30,
	mining:      40,
	woodcutting: 40,
	divination:  20,
	farming:     25,
};

export const ASSIGNMENT_TRIP_ITEM: Record<AssignableCategory, string> = {
	boss:        'Cannonball',
	minigame:    'Raw rocktail',
	gathering:   'Elder logs',
	fishing:     'Raw trout',
	mining:      'Coal',
	woodcutting: 'Willow logs',
	divination:  'Pale energy',
	farming:     'Potato seed',
};

export const PASSIVE_ACCUM_CAP_MS = 24 * 60 * 60 * 1000;

export const TIER_LEVEL_CEILING: Record<number, number> = {
	1:  40,
	2:  60,
	3:  75,
	4:  90,
	5: 120,
};

export const TIER_LEVEL_FLOOR: Record<number, number> = {
	1:  1,
	2: 10,
	3: 25,
	4: 45,
	5: 55,
};

export interface PassiveYieldEntry {
	item:        string;
	minLevel:    number;
	tierCeiling: number;
	ratePerHour: number;
}

export const PASSIVE_YIELD_TABLES: Record<SkillCategory, PassiveYieldEntry[]> = {

	fishing: [
		{ item: 'Raw shrimps',          minLevel:  1, tierCeiling: 1, ratePerHour: 120 },
		{ item: 'Raw sardine',          minLevel:  5, tierCeiling: 1, ratePerHour: 100 },
		{ item: 'Raw herring',          minLevel: 10, tierCeiling: 1, ratePerHour:  90 },
		{ item: 'Raw trout',            minLevel: 20, tierCeiling: 1, ratePerHour:  80 },
		{ item: 'Raw salmon',           minLevel: 30, tierCeiling: 1, ratePerHour:  70 },
		{ item: 'Raw tuna',             minLevel: 35, tierCeiling: 1, ratePerHour:  65 },
		{ item: 'Raw lobster',          minLevel: 40, tierCeiling: 1, ratePerHour:  60 },
		{ item: 'Raw cave eel',         minLevel: 38, tierCeiling: 2, ratePerHour:  58 },
		{ item: 'Raw swordfish',        minLevel: 50, tierCeiling: 2, ratePerHour:  55 },
		{ item: 'Raw monkfish',         minLevel: 62, tierCeiling: 2, ratePerHour:  50 },
		{ item: 'Raw karambwan',        minLevel: 65, tierCeiling: 3, ratePerHour:  45 },
		{ item: 'Raw shark',            minLevel: 76, tierCeiling: 3, ratePerHour:  40 },
		{ item: 'Raw sea turtle',       minLevel: 79, tierCeiling: 4, ratePerHour:  36 },
		{ item: 'Raw manta ray',        minLevel: 81, tierCeiling: 4, ratePerHour:  34 },
		{ item: 'Raw anglerfish',       minLevel: 82, tierCeiling: 4, ratePerHour:  35 },
		{ item: 'Raw dark crab',        minLevel: 85, tierCeiling: 4, ratePerHour:  32 },
		{ item: 'Raw rocktail',         minLevel: 120, tierCeiling: 5, ratePerHour: 15 },
	],

	mining: [
		{ item: 'Copper ore',           minLevel:  1, tierCeiling: 1, ratePerHour: 150 },
		{ item: 'Tin ore',              minLevel:  1, tierCeiling: 1, ratePerHour: 150 },
		{ item: 'Limestone',            minLevel: 10, tierCeiling: 1, ratePerHour: 130 },
		{ item: 'Iron ore',             minLevel: 15, tierCeiling: 1, ratePerHour: 120 },
		{ item: 'Soft clay',            minLevel: 20, tierCeiling: 1, ratePerHour: 140 },
		{ item: 'Coal',                 minLevel: 30, tierCeiling: 1, ratePerHour: 300 },
		{ item: 'Gold ore',             minLevel: 40, tierCeiling: 1, ratePerHour:  80 },
		{ item: 'Mithril ore',          minLevel: 55, tierCeiling: 2, ratePerHour:  70 },
		{ item: 'Lovakite ore',         minLevel: 65, tierCeiling: 3, ratePerHour:  60 },
		{ item: 'Adamantite ore',       minLevel: 70, tierCeiling: 2, ratePerHour:  55 },
		{ item: 'Obsidian shards',      minLevel: 80, tierCeiling: 3, ratePerHour:  30 },
		{ item: 'Runite ore',           minLevel: 85, tierCeiling: 3, ratePerHour:  30 },
		{ item: 'Amethyst',             minLevel: 92, tierCeiling: 4, ratePerHour:  25 },
		{ item: 'Dark animica',         minLevel: 105, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Firaxyte',             minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Verdantyte',           minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Oneiryte',             minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Starfire agate',       minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Celestyte',            minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Crystalline ore',      minLevel: 88, tierCeiling: 4, ratePerHour:  22 },
		{ item: 'Dense crystal shard',  minLevel: 94, tierCeiling: 5, ratePerHour:  15 },
	],

	woodcutting: [
		{ item: 'Logs',                 minLevel:  1, tierCeiling: 1, ratePerHour: 160 },
		{ item: 'Oak logs',             minLevel: 15, tierCeiling: 1, ratePerHour: 130 },
		{ item: 'Willow logs',          minLevel: 30, tierCeiling: 1, ratePerHour: 110 },
		{ item: 'Teak logs',            minLevel: 35, tierCeiling: 1, ratePerHour: 100 },
		{ item: 'Maple logs',           minLevel: 45, tierCeiling: 2, ratePerHour:  90 },
		{ item: 'Mahogany logs',        minLevel: 50, tierCeiling: 2, ratePerHour:  80 },
		{ item: 'Blisterwood logs',     minLevel: 62, tierCeiling: 3, ratePerHour:  60 },
		{ item: 'Yew logs',             minLevel: 60, tierCeiling: 2, ratePerHour:  65 },
		{ item: 'Magic logs',           minLevel: 75, tierCeiling: 3, ratePerHour:  45 },
		{ item: 'Redwood logs',         minLevel: 90, tierCeiling: 4, ratePerHour:  30 },
		{ item: 'Elder logs',           minLevel: 105, tierCeiling: 4, ratePerHour: 28 },
		{ item: 'Verdant logs',         minLevel: 100, tierCeiling: 4, ratePerHour: 25 },
		{ item: 'Ancient verdant logs', minLevel: 110, tierCeiling: 5, ratePerHour: 16 },
	],

	divination: [
		{ item: 'Pale energy',          minLevel:  1, tierCeiling: 1, ratePerHour: 200 },
		{ item: 'Flickering energy',    minLevel: 10, tierCeiling: 1, ratePerHour: 175 },
		{ item: 'Bright energy',        minLevel: 20, tierCeiling: 1, ratePerHour: 150 },
		{ item: 'Glowing energy',       minLevel: 30, tierCeiling: 1, ratePerHour: 130 },
		{ item: 'Sparkling energy',     minLevel: 40, tierCeiling: 1, ratePerHour: 110 },
		{ item: 'Gleaming energy',      minLevel: 50, tierCeiling: 2, ratePerHour:  90 },
		{ item: 'Vibrant energy',       minLevel: 60, tierCeiling: 2, ratePerHour:  75 },
		{ item: 'Lustrous energy',      minLevel: 70, tierCeiling: 3, ratePerHour:  60 },
		{ item: 'Elder energy',         minLevel: 75, tierCeiling: 3, ratePerHour:  60 },
		{ item: 'Brilliant energy',     minLevel: 80, tierCeiling: 4, ratePerHour:  45 },
		{ item: 'Radiant energy',       minLevel: 85, tierCeiling: 4, ratePerHour:  38 },
		{ item: 'Luminous energy',      minLevel: 90, tierCeiling: 4, ratePerHour:  32 },
		{ item: 'Incandescent energy',  minLevel: 95, tierCeiling: 5, ratePerHour:  25 },
		{ item: 'Ancient energy',       minLevel: 110, tierCeiling: 5, ratePerHour: 25 },
		{ item: 'Prismare',             minLevel: 115, tierCeiling: 5, ratePerHour:  2 },
	],

	farming: [
		{ item: 'Potato',               minLevel:  1, tierCeiling: 1, ratePerHour: 120 },
		{ item: 'Onion',                minLevel:  5, tierCeiling: 1, ratePerHour: 110 },
		{ item: 'Cabbage',              minLevel:  7, tierCeiling: 1, ratePerHour: 105 },
		{ item: 'Tomato',               minLevel: 12, tierCeiling: 1, ratePerHour: 100 },
		{ item: 'Flax',                 minLevel: 10, tierCeiling: 1, ratePerHour: 100 },
		{ item: 'Limpwurt root',        minLevel: 26, tierCeiling: 1, ratePerHour:  85 },
		{ item: 'Sweetcorn',            minLevel: 20, tierCeiling: 1, ratePerHour:  90 },
		{ item: 'Strawberry',           minLevel: 31, tierCeiling: 1, ratePerHour:  80 },
		{ item: 'Watermelon',           minLevel: 47, tierCeiling: 1, ratePerHour:  70 },
		{ item: 'Mort myre fungus',     minLevel: 45, tierCeiling: 2, ratePerHour:  65 },
		{ item: 'Snape grass',          minLevel: 61, tierCeiling: 2, ratePerHour:  60 },
		{ item: 'Ranarr weed',          minLevel: 32, tierCeiling: 2, ratePerHour:  55 },
		{ item: 'White berries',        minLevel: 59, tierCeiling: 2, ratePerHour:  55 },
		{ item: 'Snapdragon',           minLevel: 62, tierCeiling: 3, ratePerHour:  38 },
		{ item: 'Poison ivy berries',   minLevel: 70, tierCeiling: 3, ratePerHour:  45 },
		{ item: 'Dwarf weed',           minLevel: 79, tierCeiling: 3, ratePerHour:  30 },
		{ item: 'Dragon fruit',         minLevel: 81, tierCeiling: 4, ratePerHour:  25 },
		{ item: 'Torstol',              minLevel: 85, tierCeiling: 4, ratePerHour:  20 },
		{ item: 'Blood orange',         minLevel:  92, tierCeiling: 5, ratePerHour: 18 },
		{ item: 'Avocado',              minLevel:  99, tierCeiling: 5, ratePerHour: 16 },
		{ item: 'Spirit weed',          minLevel:  99, tierCeiling: 5, ratePerHour: 15 },
		{ item: 'Athelas',              minLevel:  99, tierCeiling: 5, ratePerHour: 15 },
		{ item: 'Mango',                minLevel: 105, tierCeiling: 5, ratePerHour: 14 },
		{ item: 'Grimy korulsi',        minLevel: 110, tierCeiling: 5, ratePerHour: 12 },
		{ item: 'Lychee',               minLevel: 111, tierCeiling: 5, ratePerHour: 12 },
		{ item: 'Advax berry',          minLevel: 111, tierCeiling: 5, ratePerHour: 12 },
		{ item: 'Crystal shard',        minLevel: 115, tierCeiling: 5, ratePerHour: 30 },
		{ item: 'Mystery box',          minLevel: 120, tierCeiling: 5, ratePerHour:  2 },
		{ item: 'Living bark',          minLevel: 88, tierCeiling: 4, ratePerHour:  18 },
		{ item: 'Brimstone spore',      minLevel: 93, tierCeiling: 5, ratePerHour:  12 },
	],
};

export const PASSIVE_TICK_MS = 20 * 60 * 1000;

function hashString(str: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

function mulberry32(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s += 0x6D2B79F5;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function tierRelevanceFactor(itemMinLevel: number, tier: number): number {
	const floor    = TIER_LEVEL_FLOOR[tier]   ?? 1;
	const ceiling  = TIER_LEVEL_CEILING[tier] ?? 40;
	const midpoint = Math.floor((floor + ceiling) / 2);

	if (itemMinLevel >= midpoint) return 1.00;
	if (itemMinLevel >= floor)    return 0.35;
	return                               0.08;
}

function getAccumulationEntries(
	category: SkillCategory,
	tier: number,
	skillLevel: number
): { item: string; weight: number }[] {
	const ceiling = TIER_LEVEL_CEILING[tier] ?? 40;
	return PASSIVE_YIELD_TABLES[category]
		.filter(e => e.tierCeiling <= tier && e.minLevel <= skillLevel && e.minLevel <= ceiling)
		.map(e => ({
			item:   e.item,
			weight: e.ratePerHour * tierRelevanceFactor(e.minLevel, tier),
		}))
		.filter(e => e.weight > 0);
}

function weightedPick(entries: { item: string; weight: number }[], rand: () => number): string {
	const total = entries.reduce((s, e) => s + e.weight, 0);
	let roll    = rand() * total;
	for (const e of entries) {
		roll -= e.weight;
		if (roll <= 0) return e.item;
	}
	return entries[entries.length - 1].item;
}

export function calculateAccumulatedYields(
	category: SkillCategory,
	tier: number,
	skillLevel: number,
	lastCollectedAt: number,
	now: number = Date.now(),
	rateMultiplier: number = 1.0,
	userId: string = ''
): { item: string; quantity: number }[] {
	if (tier === 0) return [];
	const entries = getAccumulationEntries(category, tier, skillLevel);
	if (entries.length === 0) return [];

	const elapsedMs = Math.min(now - lastCollectedAt, PASSIVE_ACCUM_CAP_MS);
	const startTick = Math.floor(lastCollectedAt / PASSIVE_TICK_MS);
	const endTick   = Math.floor((lastCollectedAt + elapsedMs) / PASSIVE_TICK_MS);

	const userSeed = (hashString(userId) * 2654435761 + hashString(category)) >>> 0;

	const rollsPerTick = tier;

	const totals = new Map<string, number>();

	for (let tick = startTick; tick < endTick; tick++) {
		const tickSeed = (userSeed + Math.imul(tick, 1_234_567_891)) >>> 0;
		const rand     = mulberry32(tickSeed);

		for (let roll = 0; roll < rollsPerTick; roll++) {
			const item = weightedPick(entries, rand);
			const baseQty = 1 + Math.floor(rand() * 3);
			const qty     = Math.max(1, Math.floor(baseQty * rateMultiplier));
			totals.set(item, (totals.get(item) ?? 0) + qty);
		}
	}

	return Array.from(totals.entries())
		.map(([item, quantity]) => ({ item, quantity }))
		.filter(r => r.quantity > 0)
		.sort((a, b) => b.quantity - a.quantity);
}

const MAINTENANCE_BASE_QTY: Record<string, number> = {
	'Cannonball':            1_500,
	'Colossal stem':           300,
	'Crystalline ore':         400,
	'Iron ore':              3_000,
	'Coal':                  5_000,
	'Dense crystal shard':     200,
	'Adamantite ore':        2_500,
	'Runite ore':            2_000,
	'Ancient cap':             150,
	'Runite bar':            1_200,
	'Amethyst':              1_500,
	'Blue dragon scale':     1_000,
	'Blue dragonhide':         400,
	'Sentinel core':             1,
	'Brimstone spore':       1_500,
	'Ignilace':                 80,
	'Pure essence':         30_000,
	'Air rune':             15_000,
	'Mind rune':            15_000,
	'Nature rune':           8_000,
	'Law rune':              6_000,
	'Death rune':           12_000,
	'Blood rune':            5_000,
	'Soul rune':             5_000,
	'Myconid plank':           500,
	'Diluted brimstone':       100,
	'Yew logs':              4_000,
	'Flax':                  5_000,
	'Swamp paste':           2_500,
	'Magic logs':            2_000,
	'Grapes':                5_000,
	'Snape grass':           1_500,
	'Crystalline plank':       600,
	'Mort myre fungus':      2_500,
	'Raw rocktail':            400,
	'Feather':              25_000,
	'Battlestaff':           2_500,
	'Dragonstone':           1_500,
	'Verdant logs':            800,
	'Living bark':             300,
	'Ancient verdant logs':    600,
	'Verdant plank':           400,
	'Elder logs':              350,
	'Prismare':                  8,
	'Celestyte':                40,
	'Firaxyte':                 25,
	'Starfire agate':           80,
	'Oneiryte':                 60,
	'Verdantyte':               60,
	'Rope':                  3_000,
	'Raw trout':             2_000,
	'Raw salmon':            1_800,
	'Raw lobster':           1_200,
	'Raw swordfish':           800,
	'Raw shark':               500,
	'Steel bar':             1_000,
	'Dragon harpoon':            1,
	'Raw manta ray':           300,
	'Copper ore':            5_000,
	'Tin ore':               5_000,
	'Mithril ore':           3_000,
	'Gold ore':              2_000,
	'Granite (500g)':        2_500,
	'Lovakite ore':          2_000,
	'Soft clay':             4_000,
	'Bronze pickaxe':           10,
	'Dragon pickaxe':            1,
	'Logs':                 10_000,
	'Oak logs':              7_000,
	'Willow logs':           5_000,
	'Maple logs':            3_500,
	'Teak logs':             3_000,
	'Mahogany logs':         2_000,
	'Redwood logs':            800,
	'Blisterwood logs':      1_500,
	'Bronze axe':               20,
	'Dragon axe':                1,
	'Pale energy':          20_000,
	'Flickering energy':    16_000,
	'Bright energy':        12_000,
	'Glowing energy':        9_000,
	'Sparkling energy':      7_000,
	'Gleaming energy':       5_500,
	'Vibrant energy':        4_000,
	'Lustrous energy':       3_000,
	'Brilliant energy':      2_000,
	'Incandescent energy':   1_200,
	'Potato':                6_000,
	'Sweetcorn':             4_000,
	'Watermelon':            2_500,
	'Ranarr weed':           1_200,
	'Snapdragon':              800,
	'Torstol':                 500,
	'Limpwurt root':         2_000,
	'White berries':         1_500,
	'Dragon fruit':            600,
	'Compost':               5_000,
	'Supercompost':          3_000,
	'Ultracompost':          1_500,
};

const MAINTENANCE_ITEM_CAPS: Partial<Record<string, number>> = {
	'Sentinel core':    50,
	'Verdant heart':    50,
	'Empyrean shards':  25,
};

function tierMultiplier(tier: number): number {
	return Math.min(1 + (tier - 1) * 0.35, 2.1);
}

export function getCategoryItemPool(category: UpgradeCategory, tier: number): string[] {
	const seen    = new Set<string>();
	const tierDef = upgradeDefinitions[category][tier - 1];
	if (!tierDef) return [];
	for (const [item] of tierDef.cost.items()) {
		if (item.name !== 'Coins') seen.add(item.name);
	}
	return Array.from(seen);
}

export interface MaintenanceDemand {
	bank:       Bank;
	flavorText: string;
	weekNumber: number;
}

export function getWeeklyMaintenanceDemand(
	category: UpgradeCategory,
	tier: number,
	userId: string,
	now: number = Date.now()
): MaintenanceDemand {
	if (tier === 0) return { bank: new Bank(), flavorText: '', weekNumber: 0 };

	const weekNumber = Math.floor(now / MAINTENANCE_WINDOW_MS);
	const seed       = (weekNumber * 2654435761 + hashString(category) + hashString(userId)) >>> 0;
	const rand       = mulberry32(seed);

	const pool      = getCategoryItemPool(category, tier);
	const meta      = upgradeCategoryMeta[category];
	const mult      = tierMultiplier(tier);
	const maxItems  = Math.min(5, pool.length);
	const itemCount = 1 + Math.floor(rand() * maxItems);

	const shuffled = [...pool];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	const chosen = shuffled.slice(0, itemCount);

	const catMult = CATEGORY_MAINTENANCE_MULTIPLIER[category];
	const bank = new Bank();
	for (const itemName of chosen) {
		const baseQty = MAINTENANCE_BASE_QTY[itemName] ?? 500;
		const rawQty = Math.max(1, Math.round(baseQty * mult * catMult / 50) * 50);
		const cap    = MAINTENANCE_ITEM_CAPS[itemName];
		const qty    = cap !== undefined ? Math.min(rawQty, cap) : rawQty;
		bank.add(itemName, qty);
	}

	const lines = meta.maintenanceFlavorLines;
	return {
		bank,
		flavorText: lines[Math.floor(rand() * lines.length)],
		weekNumber,
	};
}

export interface UpgradeTier {
	tier:        number;
	cost:        Bank;
	name:        string;
	description: string;
	bonus:       string;
	flavorText:  string;
}

export interface UpgradeCategoryMeta {
	label:                  string;
	locationName:           string;
	flavorIntro:            string;
	maintenanceFlavorLines: string[];
}

export const upgradeCategoryMeta: Record<UpgradeCategory, UpgradeCategoryMeta> = {
	boss: {
		label: 'Warcamp Fortifications', locationName: 'the Warcamp',
		flavorIntro: "Reinforce the warcamp's walls and arm the garrison.",
		maintenanceFlavorLines: [
			"The garrison is running low. Resupply before the next assault.",
			"Walls need patching. The quartermaster is short on materials.",
			"Cannon crews are restless. They need more than promises.",
			"The armoury shelves are looking thin this week.",
			"Word from the gatehouse: stockpiles are down. Time to restock.",
		]
	},
	megaboss: {
		label: 'Archon Sanctum', locationName: 'the Archon Sanctum',
		flavorIntro: 'Construct the ritual sanctum and open a path to the Archon.',
		maintenanceFlavorLines: [
			"The ritual circles are dimming. They hunger for more.",
			"Scholars report the resonance is weakening. Feed the sanctum.",
			"Something stirs beneath the stone. The wards need refreshing.",
			"The Archon grows distant. Renew the offering.",
			"Faint tremors in the foundation. The sanctum demands tribute.",
		]
	},
	minigame: {
		label: 'Settlement Infrastructure', locationName: 'the Settlement',
		flavorIntro: "Develop the settlement's facilities to support all camp operations.",
		maintenanceFlavorLines: [
			"The settlement traders are grumbling. Time to restock the stalls.",
			"Roofs need fixing, stores need filling. The usual.",
			"Morale dips when the shelves are bare. Keep them stocked.",
			"A settlement runs on more than goodwill. Supplies are needed.",
			"The tavern is running low. That alone will cause a mutiny.",
		]
	},
	gathering: {
		label: "Expedition Outfitters", locationName: "the Outfitters' Lodge",
		flavorIntro: 'Equip crews with better tools to gather faster.',
		maintenanceFlavorLines: [
			"Expedition crews are wearing through their gear. Resupply needed.",
			"The lodge quartermaster has filed another requisition. Again.",
			"Sleds are splintering, tools are blunting. Standard week, really.",
			"Crews won't head out without a full kit. Can't blame them.",
			"The outfitters need restocking before the next expedition departs.",
		]
	},
	prismare: {
		label: 'Astral Observatory', locationName: 'the Astral Observatory',
		flavorIntro: "Expand the observatory and attune it to the Prismare Ring's energies.",
		maintenanceFlavorLines: [
			"The orrery is slowing. The scholars are losing sleep over it.",
			"Prismare resonance is drifting. The instruments need recalibrating.",
			"A faint hum has gone quiet. The observatory needs attention.",
			"The lenses are clouding. Bring what is needed to clear them.",
			"Something in the alignment has shifted. The scholars are frantic.",
		]
	},
	fishing: {
		label: 'Fishing Docks', locationName: 'the Fishing Docks',
		flavorIntro: 'Maintain the docks and keep lines in the water around the clock.',
		maintenanceFlavorLines: [
			"Nets are fraying and bait is running low. The docks need tending.",
			"The catch has been thin. Time to restock the fishing supplies.",
			"Dock hands are idle without bait and line. Sort it out.",
			"Salt, rope, and patience. That is what the docks need this week.",
			"A low tide and empty holds. The dockhands are restless.",
		]
	},
	mining: {
		label: 'Excavation Tunnels', locationName: 'the Excavation Tunnels',
		flavorIntro: 'Shore up the tunnels and keep the mining crews working deep veins.',
		maintenanceFlavorLines: [
			"The tunnel props are splintering. Time for fresh materials.",
			"Pickaxes are blunting faster than expected this week.",
			"Deep vein access requires constant upkeep. Supply the tunnels.",
			"The foreman's list is long. The tunnels need resupplying.",
			"Support beams and sorting equipment. The usual weekly demand.",
		]
	},
	woodcutting: {
		label: 'Lumberyard', locationName: 'the Lumberyard',
		flavorIntro: 'Keep the axe crews working and the timber moving.',
		maintenanceFlavorLines: [
			"Axes need resharpening. Bring what the camps need.",
			"The timber yard is nearly empty. Keep the crews supplied.",
			"Saw blades and rope. The camp foreman's request this week.",
			"The lumber haul has slowed. Time to resupply the camps.",
			"Nothing stops a woodcutting camp faster than dull tools.",
		]
	},
	divination: {
		label: 'Divination Spire', locationName: 'the Divination Spire',
		flavorIntro: "Attune the spire to draw energy from the island's ley lines.",
		maintenanceFlavorLines: [
			"The energy conduits are weakening. Reinforcements needed.",
			"Scholars have flagged a drift in the ley line readings.",
			"The spire hums off-key this week. Bring what it needs.",
			"Energy fading. The collectors need fresh calibration materials.",
			"The island's energies are restless. Feed the spire.",
		]
	},
	farming: {
		label: 'Fertile Fields', locationName: 'the Fertile Fields',
		flavorIntro: "Tend the island's growing plots and keep the soil producing.",
		maintenanceFlavorLines: [
			"The soil is thinning. The plots need compost and care.",
			"Seed stocks are low. Time to tend the growing plots.",
			"The harvesters need supplies before the next growing cycle.",
			"Weeds and worn tools. Another week on the island farm.",
			"The farmers are waiting on fresh materials.",
		]
	},
};

export const MAINTENANCE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const CATEGORY_MAINTENANCE_MULTIPLIER: Record<UpgradeCategory, number> = {
	boss:        3,
	megaboss:    4,
	minigame:    3,
	gathering:   3,
	prismare:    0.2,
	fishing:     2,
	mining:      2,
	woodcutting: 2,
	divination:  2,
	farming:     2,
};

export const upgradeDefinitions: Record<UpgradeCategory, UpgradeTier[]> = {

	boss: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Colossal stem',        1_800)
				.add('Crystalline ore',        700)
				.add('Iron ore',             7_000)
				.add('Coal',                14_000)
				.add('Cannonball',           8_800),
			name: 'Warcamp Fortifications I',
			description: 'Palisade walls reinforced, cannon emplacements installed.',
			bonus: '5% faster boss kills', flavorText: 'Iron and coal. The basics.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Colossal stem',        5_250)
				.add('Crystalline ore',      1_750)
				.add('Dense crystal shard',  1_750)
				.add('Adamantite ore',      10_500)
				.add('Runite ore',          14_000)
				.add('Battlestaff',          5_250),
			name: 'Warcamp Fortifications II',
			description: 'Armoury stocked with runite. Battlemages posted to the walls.',
			bonus: '10% faster boss kills', flavorText: 'Runite and battle staves. The garrison grows stronger.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Ancient cap',            700)
				.add('Crystalline ore',      3_500)
				.add('Dense crystal shard',  5_250)
				.add('Runite bar',           7_000)
				.add('Amethyst',             8_750)
				.add('Blue dragon scale',    7_000),
			name: 'Warcamp Fortifications III',
			description: 'Elite warriors equipped with dragonscale armour and amethyst ammo.',
			bonus: '15% faster boss kills', flavorText: 'Dragonscale and amethyst. Few enemies stand in the way.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Ancient cap',          1_400)
				.add('Crystalline ore',      7_000)
				.add('Dense crystal shard', 10_500)
				.add('Runite bar',          17_500)
				.add('Amethyst',            17_500)
				.add('Blue dragon scale',   10_500)
				.add('Blue dragonhide',      1_750)
				.add('Sentinel core',             1),
			name: 'Warcamp Fortifications IV',
			description: 'Sentinel cores in the command post grant real-time island awareness.',
			bonus: '20% faster boss kills', flavorText: 'The sentinel cores see everything.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Ancient cap',          2_800)
				.add('Crystalline ore',     14_000)
				.add('Dense crystal shard', 21_000)
				.add('Runite bar',          28_000)
				.add('Amethyst',            35_000)
				.add('Blue dragon scale',   10_500)
				.add('Blue dragonhide',      5_250)
				.add('Sentinel core',             2),
			name: 'Warcamp Fortifications V',
			description: 'A fully fortified war machine. No beast on the island is safe.',
			bonus: '25% faster boss kills', flavorText: 'The warcamp is complete. The island is yours.'
		},
	],

	megaboss: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Brimstone spore',      1_750)
				.add('Ignilace',               175)
				.add('Pure essence',        87_500)
				.add('Air rune',            35_000)
				.add('Mind rune',           35_000),
			name: 'Archon Sanctum I',
			description: 'Foundation stones laid, first ritual performed. The Archon stirs.',
			bonus: 'Unlocks access to the Archon', flavorText: 'Brimstone and rune-etched stones. Something stirs.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Brimstone spore',      1_750)
				.add('Ignilace',                52)
				.add('Crystalline ore',        700)
				.add('Nature rune',         21_000)
				.add('Law rune',            14_000)
				.add('Death rune',          35_000),
			name: 'Archon Sanctum II',
			description: 'Ritual circles reinforced with law and death runes.',
			bonus: '10% better regular loot from the Archon', flavorText: 'The Archon gives more freely now.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Ancient cap',             17)
				.add('Ignilace',             3_500)
				.add('Dense crystal shard',  1_750)
				.add('Blood rune',          10_500)
				.add('Soul rune',           10_500)
				.add('Death rune',          70_000),
			name: 'Archon Sanctum III',
			description: "Blood and soul runes saturate the walls. The Archon's hoard is more accessible.",
			bonus: '20% better regular loot from the Archon', flavorText: 'Nothing the Archon holds can stay hidden.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Ancient cap',             87)
				.add('Ignilace',            10_500)
				.add('Dense crystal shard',  4_200)
				.add('Blood rune',          28_000)
				.add('Soul rune',           14_000)
				.add('Pure essence',        87_500)
				.add('Sentinel core',             1),
			name: 'Archon Sanctum IV',
			description: "Sentinel cores open a direct line to the Archon's hoard.",
			bonus: '35% better regular loot from the Archon', flavorText: 'The Archon has no secrets left.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Ancient cap',            262)
				.add('Ignilace',            21_000)
				.add('Dense crystal shard',  8_750)
				.add('Blood rune',          52_500)
				.add('Soul rune',           26_250)
				.add('Pure essence',       175_000)
				.add('Sentinel core',            2)
				.add('Verdant heart',            1),
			name: 'Archon Sanctum V',
			description: 'Verdant hearts power the sanctum. The Archon yields everything.',
			bonus: '50% better regular loot from the Archon', flavorText: 'The sanctum is complete.'
		},
	],

	minigame: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Myconid plank',        1_050)
				.add('Diluted brimstone',       87)
				.add('Yew logs',            10_500)
				.add('Flax',                14_000)
				.add('Swamp paste',          7_000),
			name: 'Settlement Infrastructure I',
			description: 'First permanent structures built. Workers now have shelter and morale.',
			bonus: '5% better minigame rewards', flavorText: "Yew timber and flax daub. Rough, but it's a start."
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Myconid plank',        2_450)
				.add('Diluted brimstone',      525)
				.add('Brimstone spore',        700)
				.add('Magic logs',           5_250)
				.add('Grapes',              14_000)
				.add('Snape grass',          3_500),
			name: 'Settlement Infrastructure II',
			description: 'A tavern, a distillery, and a marketplace raise settlement morale.',
			bonus: '10% better minigame rewards', flavorText: 'Spirits on the house. Morale has never been higher.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Crystalline plank',    3_500)
				.add('Diluted brimstone',    1_750)
				.add('Dense crystal shard',  1_750)
				.add('Mort myre fungus',     7_000)
				.add('Raw rocktail',         5_250)
				.add('Feather',             35_000),
			name: 'Settlement Infrastructure III',
			description: 'An alchemical quarter and trade stalls draw rare goods through the settlement.',
			bonus: '15% better minigame rewards', flavorText: 'Traders are finding their way here.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Crystalline plank',    8_750)
				.add('Diluted brimstone',    4_200)
				.add('Dense crystal shard',  4_200)
				.add('Feather',             70_000)
				.add('Raw rocktail',        12_250)
				.add('Battlestaff',         10_500)
				.add('Sentinel core',             1),
			name: 'Settlement Infrastructure IV',
			description: 'Sentinel cores automate defence across the entire settlement.',
			bonus: '20% better minigame rewards', flavorText: 'The settlement practically runs itself.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Crystalline plank',   17_500)
				.add('Diluted brimstone',    8_750)
				.add('Dense crystal shard',  8_750)
				.add('Feather',            157_500)
				.add('Raw rocktail',        24_500)
				.add('Battlestaff',         26_250)
				.add('Dragonstone',          7_000)
				.add('Verdant heart',             1),
			name: 'Settlement Infrastructure V',
			description: 'Dragonstone halls and verdant heart conduits. A city in the wilderness.',
			bonus: '25% better minigame rewards', flavorText: 'This is a city now.'
		},
	],

	gathering: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Verdant logs',         1_750)
				.add('Living bark',            350)
				.add('Elder logs',          21_000)
				.add('Iron ore',             7_000)
				.add('Coal',                14_000),
			name: 'Expedition Outfitters I',
			description: 'First crews outfitted with iron tools and elder log sleds.',
			bonus: '5% faster gathering', flavorText: 'Slow but steady, the carts are filling up.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Verdant logs',         3_500)
				.add('Living bark',            875)
				.add('Ancient verdant logs', 1_750)
				.add('Elder logs',          42_000)
				.add('Adamantite ore',      21_000)
				.add('Runite ore',          28_000),
			name: 'Expedition Outfitters II',
			description: 'Upgraded to adamant and runite tools with ancient verdant sleds.',
			bonus: '10% faster gathering', flavorText: "The terrain doesn't slow them anymore."
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Ancient verdant logs',   525)
				.add('Living bark',          1_400)
				.add('Verdant plank',          700)
				.add('Elder logs',          42_000)
				.add('Runite bar',          21_000)
				.add('Dragonstone',          5_250),
			name: 'Expedition Outfitters III',
			description: 'Dragonstone gathering frames push expedition efficiency yet further.',
			bonus: '15% faster gathering', flavorText: "The wilderness doesn't halt them."
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Ancient verdant logs', 1_400)
				.add('Living bark',          2_800)
				.add('Verdant plank',        1_750)
				.add('Elder logs',          70_000)
				.add('Runite bar',          42_000)
				.add('Dragonstone',         10_500)
				.add('Amethyst',             8_750)
				.add('Sentinel core',            1),
			name: 'Expedition Outfitters IV',
			description: 'Sentinel cores take crews to the richest resources.',
			bonus: '20% faster gathering', flavorText: 'Nobody idles anymore.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Ancient verdant logs', 2_800)
				.add('Living bark',          5_250)
				.add('Verdant plank',        3_500)
				.add('Elder logs',         105_000)
				.add('Runite bar',          52_500)
				.add('Dragonstone',         17_500)
				.add('Amethyst',            17_500)
				.add('Sentinel core',            2)
				.add('Verdant heart',            1),
			name: 'Expedition Outfitters V',
			description: 'Verdant hearts bond the rigs to the island itself, maximising yields.',
			bonus: '25% faster gathering', flavorText: 'The island gives freely now.'
		},
	],

	prismare: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',             2_000_000_000)
				.add('Prismare',                    100)
				.add('Celestyte',                   500)
				.add('Firaxyte',                    500)
				.add('Air rune',              1_000_000)
				.add('Mind rune',             1_000_000)
				.add('Pure essence',          1_000_000)
				.add('Empyrean shards',              50),
			name: 'Astral Observatory I',
			description: 'Observatory dome raised, the first instruments calibrated.',
			bonus: '+0.5% global XP', flavorText: 'The prismare shard levitates and spins.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',            4_000_000_000)
				.add('Prismare',                   200)
				.add('Starfire agate',            1000)
				.add('Oneiryte',                  1000)
				.add('Verdantyte',                1000)
				.add('Nature rune',            600_000)
				.add('Law rune',               450_000)
				.add('Death rune',           1_000_000)
				.add('Empyrean shards',            100),
			name: 'Astral Observatory II',
			description: 'Starfire agate lenses and oneiryte channels focus the observatory.',
			bonus: '+1% global XP', flavorText: 'Oneiryte dust in the air.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',            6_000_000_000)
				.add('Prismare',                   400)
				.add('Celestyte',                 1500)
				.add('Firaxyte',                  1500)
				.add('Blood rune',           4_000_000)
				.add('Soul rune',            4_000_000)
				.add('Death rune',           2_000_000)
				.add('Empyrean shards',            150),
			name: 'Astral Observatory III',
			description: 'Firaxyte cores ignite, flooding the island with ambient glow.',
			bonus: '+1.5% global XP', flavorText: 'Everything on the island feels sharper.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',            8_000_000_000)
				.add('Prismare',                   750)
				.add('Celestyte',                3_000)
				.add('Firaxyte',                 3_000)
				.add('Starfire agate',           3_000)
				.add('Oneiryte',                 3_000)
				.add('Blood rune',           1_000_000)
				.add('Soul rune',              600_000)
				.add('Pure essence',         2_500_000)
				.add('Sentinel core',                2)
				.add('Empyrean shards',             300),
			name: 'Astral Observatory IV',
			description: 'Sentinel cores synchronise all instruments into a unified array.',
			bonus: '+2% global XP', flavorText: 'The hum is constant now.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',           10_000_000_000)
				.add('Prismare',                 1_500)
				.add('Celestyte',                7_500)
				.add('Firaxyte',                 7_500)
				.add('Starfire agate',           7_500)
				.add('Oneiryte',                 7_500)
				.add('Verdantyte',               7_500)
				.add('Blood rune',           1_750_000)
				.add('Soul rune',            1_000_000)
				.add('Pure essence',         5_000_000)
				.add('Sentinel core',                3)
				.add('Verdant heart',                2)
				.add('Dragonstone',             25_000)
				.add('Empyrean shards',            500),
			name: 'Astral Observatory V',
			description: 'Prismare Resonance achieved.',
			bonus: '+2.5% global XP', flavorText: 'The orrery spins alone.'
		},
	],

	fishing: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Rope',                 2_000)
				.add('Feather',             10_000)
				.add('Raw trout',            5_000)
				.add('Willow logs',          3_000),
			name: 'Fishing Docks I',
			description: 'Basic dock repairs. Lines in the water, small catches only.',
			bonus: 'Passively accumulates fish up to level 40', flavorText: 'The docks are in a state. But the lines are in the water.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Rope',                 5_000)
				.add('Feather',             25_000)
				.add('Raw lobster',          3_000)
				.add('Yew logs',             2_000)
				.add('Steel bar',            1_500),
			name: 'Fishing Docks II',
			description: 'Deep-sea rigs added. Better catches for experienced fishers.',
			bonus: 'Passively accumulates fish up to level 60', flavorText: 'Steel frames and yew hulls. The serious fishing begins.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Rope',                10_000)
				.add('Raw shark',            2_000)
				.add('Magic logs',           2_000)
				.add('Runite bar',           1_000)
				.add('Feather',             50_000),
			name: 'Fishing Docks III',
			description: 'Runite-reinforced rigs reach waters rich with shark and karambwan.',
			bonus: 'Passively accumulates fish up to level 75', flavorText: 'The deep water gives up its catches now.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Runite bar',           2_500)
				.add('Raw manta ray',        2_000)
				.add('Dragon harpoon',           1)
				.add('Feather',            100_000)
				.add('Magic logs',           4_000),
			name: 'Fishing Docks IV',
			description: 'Dragon harpoon rigs and enchanted nets pull in the deep-sea bounty.',
			bonus: 'Passively accumulates fish up to level 90', flavorText: 'Nothing in these waters is safe from the nets now.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Runite bar',           5_000)
				.add('Raw rocktail',         5_000)
				.add('Feather',            200_000)
				.add('Ancient verdant logs',   500)
				.add('Verdant plank',          300)
				.add('Sentinel core',            1),
			name: 'Fishing Docks V',
			description: 'Island-attuned rigging and sentinel-guided nets draw from every depth.',
			bonus: 'Passively accumulates fish up to level 120', flavorText: 'The sea has no secrets from the docks now.'
		},
	],

	mining: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Iron ore',            10_000)
				.add('Coal',                15_000)
				.add('Logs',                 5_000)
				.add('Bronze pickaxe',          10),
			name: 'Excavation Tunnels I',
			description: 'Initial shafts dug, copper and tin flowing from the rock.',
			bonus: 'Passively accumulates ore up to level 40', flavorText: 'Dim lanterns and shallow shafts. A start.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Iron ore',            20_000)
				.add('Coal',                30_000)
				.add('Steel bar',            3_000)
				.add('Mithril ore',          5_000)
				.add('Oak logs',            10_000),
			name: 'Excavation Tunnels II',
			description: 'Deeper shafts reach mithril and adamant veins.',
			bonus: 'Passively accumulates ore up to level 60', flavorText: 'Steel props and better lanterns. The crews dig deeper.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Adamantite ore',      10_000)
				.add('Runite ore',           5_000)
				.add('Runite bar',           2_000)
				.add('Coal',                50_000)
				.add('Magic logs',           2_000),
			name: 'Excavation Tunnels III',
			description: "Runite-supported tunnels reach the island's richest ore veins.",
			bonus: 'Passively accumulates ore up to level 75', flavorText: 'The real seams begin here.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Runite bar',           5_000)
				.add('Amethyst',             5_000)
				.add('Coal',               100_000)
				.add('Dragon pickaxe',           1)
				.add('Dense crystal shard',  1_000),
			name: 'Excavation Tunnels IV',
			description: 'Dragon pickaxe operations and crystal-lined shafts reach deep amethyst seams.',
			bonus: 'Passively accumulates ore up to level 90', flavorText: 'The island bleeds ore. You just have to dig deep enough.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Runite bar',          10_000)
				.add('Amethyst',            15_000)
				.add('Dense crystal shard',  3_000)
				.add('Crystalline ore',      2_000)
				.add('Sentinel core',             1),
			name: 'Excavation Tunnels V',
			description: 'Sentinel-guided deep bore tunnels reach crystalline veins found nowhere else.',
			bonus: 'Passively accumulates ore up to level 120', flavorText: 'The tunnels have a heartbeat now.'
		},
	],

	woodcutting: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Logs',                20_000)
				.add('Bronze axe',              20)
				.add('Rope',                 3_000)
				.add('Coal',                 5_000),
			name: 'Lumberyard I',
			description: 'Basic axes and camp shelters. Low-tier timber only.',
			bonus: 'Passively accumulates logs up to level 40', flavorText: 'Crude but effective. The timber flows slowly.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Oak logs',            20_000)
				.add('Steel bar',            2_000)
				.add('Rope',                 8_000)
				.add('Yew logs',             3_000),
			name: 'Lumberyard II',
			description: 'Better saws reach maple and teak groves across the island.',
			bonus: 'Passively accumulates logs up to level 60', flavorText: 'Steel saws and seasoned crews. The teak stands are falling.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Yew logs',            10_000)
				.add('Magic logs',           3_000)
				.add('Runite bar',           1_500)
				.add('Rope',                15_000),
			name: 'Lumberyard III',
			description: 'Runite-edged axes bite through yew and magic trees.',
			bonus: 'Passively accumulates logs up to level 75', flavorText: "The magic trees don't hold out for long."
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Magic logs',          10_000)
				.add('Runite bar',           3_000)
				.add('Elder logs',           2_000)
				.add('Dragon axe',               1)
				.add('Verdant logs',         1_000),
			name: 'Lumberyard IV',
			description: 'Dragon axe crews fell redwood and elder groves with ease.',
			bonus: 'Passively accumulates logs up to level 90', flavorText: 'Redwood falls like any other tree now.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Elder logs',          10_000)
				.add('Verdant logs',         3_000)
				.add('Living bark',          1_000)
				.add('Ancient verdant logs',   500)
				.add('Sentinel core',            1),
			name: 'Lumberyard V',
			description: 'Ancient verdant timber and sentinel-guided crews work the deepest groves.',
			bonus: 'Passively accumulates logs up to level 120', flavorText: 'The island itself seems to offer up its wood now.'
		},
	],

	divination: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Pale energy',         13_000)
				.add('Pure essence',        25_000)
				.add('Mind rune',          100_000),
			name: 'Divination Spire I',
			description: 'A crude focus draws pale and flickering energies from the ley lines.',
			bonus: 'Passively accumulates energy up to level 40', flavorText: 'A faint shimmer. The spire is waking.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Sparkling energy',      8500)
				.add('Pure essence',        50_000)
				.add('Nature rune',        100_000)
				.add('Law rune',           100_000),
			name: 'Divination Spire II',
			description: 'Refined conduits draw golden and vibrant energies.',
			bonus: 'Passively accumulates energy up to level 60', flavorText: 'Golden light at the apex. The scholars are excited.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Vibrant energy',        6500)
				.add('Brilliant energy',      4500)
				.add('Lustrous energy',       5500)
				.add('Death rune',         150_000)
				.add('Blood rune',         200_000)
				.add('Pure essence',       100_000),
			name: 'Divination Spire III',
			description: 'Lustrous and brilliant energies flood the island with ambient resonance.',
			bonus: 'Passively accumulates energy up to level 75', flavorText: 'The air tastes different near the spire now.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Luminous energy',       3300)
				.add('Soul rune',          100_000)
				.add('Blood rune',         300_000)
				.add('Pure essence',       200_000),
			name: 'Divination Spire IV',
			description: 'Luminous and radiant energies attune the entire island to the spire.',
			bonus: 'Passively accumulates energy up to level 90', flavorText: 'The hum carries through the ground now.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Incandescent energy',   2800)
				.add('Luminous energy',       3500)
				.add('Ancient energy',         250)
				.add('Soul rune',          250_000)
				.add('Elder rune',          10_000)
				.add('Pure essence',       400_000)
				.add('Prismare',                 5)
				.add('Sentinel core',            1),
			name: 'Divination Spire V',
			description: 'Prismare-tuned incandescent conduits draw the rarest energies from the void.',
			bonus: 'Passively accumulates energy up to level 120 including prismare', flavorText: 'The spire no longer needs tending. It tends itself.'
		},
	],

	farming: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins',        1_000_000_000)
				.add('Potato seed',         10_000)
				.add('Compost',              5_000)
				.add('Bucket of water',      3_000)
				.add('Rake',                    10),
			name: 'Fertile Fields I',
			description: 'Basic allotment patches tended. Crops grow slowly but steadily.',
			bonus: 'Passively accumulates crops up to level 40', flavorText: 'Dirt under the fingernails. The plots are growing.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins',        2_000_000_000)
				.add('Snape grass seed',     5_000)
				.add('Supercompost',         5_000)
				.add('Watermelon seed',      3_000)
				.add('Ranarr seed',          2_000)
				.add('Bucket of water',     10_000),
			name: 'Fertile Fields II',
			description: 'Herb patches established. Snape grass and ranarr grow alongside allotments.',
			bonus: 'Passively accumulates crops up to level 60', flavorText: 'The herb rows are fragrant this week. A good sign.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins',        3_000_000_000)
				.add('Snapdragon seed',      2_000)
				.add('Supercompost',        15_000)
				.add('Mort myre fungus',     5_000)
				.add('Poison ivy seed',      1_000),
			name: 'Fertile Fields III',
			description: 'Magic assisted growth reaches the rarer herb varieties.',
			bonus: 'Passively accumulates crops up to level 75', flavorText: 'The magic watering cans keep the plots thriving.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins',        4_000_000_000)
				.add('Torstol seed',         1_000)
				.add('Ultracompost',        10_000)
				.add('Dragonfruit tree seed',   50)
				.add('Living bark',          1_000),
			name: 'Fertile Fields IV',
			description: 'Dragon fruit trees and ultra-composted torstol patches reach peak yield.',
			bonus: 'Passively accumulates crops up to level 90', flavorText: 'Dragon fruit and torstol. The plots smell extraordinary.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins',        5_000_000_000)
				.add('Torstol seed',         3_000)
				.add('Ultracompost',        25_000)
				.add('Living bark',          3_000)
				.add('Brimstone spore',      1_000)
				.add('Verdant logs',         1_500)
				.add('Sentinel core',            1),
			name: 'Fertile Fields V',
			description: 'Sentinel tended crops grow in island-enriched soil.',
			bonus: 'Passively accumulates crops up to level 120', flavorText: 'The island grows things here that grow nowhere else.'
		},
	],
};

export type IslandUpgradeTiers = {
	boss: number; megaboss: number; minigame: number; gathering: number; prismare: number;
	fishing: number; mining: number; woodcutting: number; divination: number; farming: number;
};

export type IslandUpgradeContributions = {
	[K in UpgradeCategory]: Partial<Record<string, number>>;
};

export type IslandMaintenanceTimestamps = {
	[K in UpgradeCategory]: number;
};

export type IslandLastCollected = {
	[K in SkillCategory]: number;
};

export const defaultIslandUpgrades: IslandUpgradeTiers = {
	boss: 0, megaboss: 0, minigame: 0, gathering: 0, prismare: 0,
	fishing: 0, mining: 0, woodcutting: 0, divination: 0, farming: 0,
};

export const defaultIslandContributions: IslandUpgradeContributions = {
	boss: {}, megaboss: {}, minigame: {}, gathering: {}, prismare: {},
	fishing: {}, mining: {}, woodcutting: {}, divination: {}, farming: {},
};

export const defaultMaintenanceTimestamps: IslandMaintenanceTimestamps = {
	boss: 0, megaboss: 0, minigame: 0, gathering: 0, prismare: 0,
	fishing: 0, mining: 0, woodcutting: 0, divination: 0, farming: 0,
};

export const defaultLastCollected: IslandLastCollected = {
	fishing: 0, mining: 0, woodcutting: 0, divination: 0, farming: 0,
};

export function getTier(upgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): number {
	return (upgrades?.[category] ?? 0) as number;
}

export function getNextUpgradeForCategory(
	upgrades: Partial<IslandUpgradeTiers>,
	category: UpgradeCategory
): UpgradeTier | null {
	const current = getTier(upgrades, category);
	return upgradeDefinitions[category].find(t => t.tier === current + 1) ?? null;
}

export function getContributionProgress(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): number {
	const costItems      = nextUpgrade.cost.items();
	const totalCostItems = costItems.reduce((s: number, [, q]: [unknown, number]) => s + q, 0);
	if (totalCostItems === 0) return 0;
	let contributed = 0;
	for (const [item, qty] of costItems) {
		contributed += Math.min(contributions[item.id.toString()] ?? 0, qty);
	}
	return Math.floor((contributed / totalCostItems) * 100);
}

export function isContributionComplete(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): boolean {
	for (const [item, qty] of nextUpgrade.cost.items()) {
		if ((contributions[item.id.toString()] ?? 0) < qty) return false;
	}
	return true;
}

export function getRemainingCost(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): Bank {
	const remaining = new Bank();
	for (const [item, qty] of nextUpgrade.cost.items()) {
		const still = qty - (contributions[item.id.toString()] ?? 0);
		if (still > 0) remaining.add(item.id, still);
	}
	return remaining;
}

export function isCategoryMaintained(
	timestamps: IslandMaintenanceTimestamps,
	category: UpgradeCategory,
	now: number = Date.now()
): boolean {
	const last = timestamps[category] ?? 0;
	return last > 0 && now - last < MAINTENANCE_WINDOW_MS;
}

export function maintenanceTimeRemaining(
	timestamps: IslandMaintenanceTimestamps,
	category: UpgradeCategory,
	now: number = Date.now()
): number {
	const last = timestamps[category] ?? 0;
	if (last === 0) return 0;
	return Math.max(0, last + MAINTENANCE_WINDOW_MS - now);
}

export function formatDuration(ms: number): string {
	if (ms <= 0) return 'expired';
	const mins  = Math.floor(ms / 60_000);
	const days  = Math.floor(mins / 1440);
	const hours = Math.floor((mins % 1440) / 60);
	const parts = [];
	if (days > 0)  parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (parts.length === 0) parts.push(`${mins % 60}m`);
	return parts.join(' ');
}

export function isCategoryAssignable(category: UpgradeCategory): category is AssignableCategory {
	return ASSIGNABLE_CATEGORIES.includes(category as AssignableCategory);
}

export function getActiveAssignment(
	assignment: AssignableCategory | null,
	timestamps: IslandMaintenanceTimestamps,
	now: number = Date.now()
): AssignableCategory | null {
	if (!assignment) return null;
	if (!isCategoryMaintained(timestamps, assignment, now)) return null;
	return assignment;
}

export function getAssignmentTripCost(
	assignment: AssignableCategory | null,
	timestamps: IslandMaintenanceTimestamps,
	now: number = Date.now()
): Bank {
	const active = getActiveAssignment(assignment, timestamps, now);
	if (!active) return new Bank();
	return new Bank().add(ASSIGNMENT_TRIP_ITEM[active], ASSIGNMENT_TRIP_COSTS[active]);
}

function applyAssignmentMultiplier(
	base: number,
	category: UpgradeCategory,
	active: AssignableCategory | null
): number {
	if (!active) return base;
	if (category === active) return base * ASSIGNMENT_BOOST;
	return base * ASSIGNMENT_PENALTY;
}

function resolveAssignment(
	timestamps?: IslandMaintenanceTimestamps,
	assignment?: AssignableCategory | null
): AssignableCategory | null {
	if (!timestamps || assignment === undefined) return null;
	return getActiveAssignment(assignment ?? null, timestamps);
}

export function getBossSpeedBonus(u: Partial<IslandUpgradeTiers>, t?: IslandMaintenanceTimestamps, a?: AssignableCategory | null): number {
	const tier = getTier(u, 'boss');
	if (tier === 0 || (t && !isCategoryMaintained(t, 'boss'))) return 0;
	return applyAssignmentMultiplier(([0,.05,.10,.15,.20,.25][tier] ?? 0), 'boss', resolveAssignment(t, a));
}

export function getMinigameRewardBonus(u: Partial<IslandUpgradeTiers>, t?: IslandMaintenanceTimestamps, a?: AssignableCategory | null): number {
	const tier = getTier(u, 'minigame');
	if (tier === 0 || (t && !isCategoryMaintained(t, 'minigame'))) return 0;
	return applyAssignmentMultiplier(([0,.05,.10,.15,.20,.25][tier] ?? 0), 'minigame', resolveAssignment(t, a));
}

export function getGatheringSpeedBonus(u: Partial<IslandUpgradeTiers>, t?: IslandMaintenanceTimestamps, a?: AssignableCategory | null): number {
	const tier = getTier(u, 'gathering');
	if (tier === 0 || (t && !isCategoryMaintained(t, 'gathering'))) return 0;
	return applyAssignmentMultiplier(([0,.05,.10,.15,.20,.25][tier] ?? 0), 'gathering', resolveAssignment(t, a));
}

export function getPrismareXPBonus(u: Partial<IslandUpgradeTiers>, t?: IslandMaintenanceTimestamps, a?: AssignableCategory | null): number {
	const tier = getTier(u, 'prismare');
	if (tier === 0 || (t && !isCategoryMaintained(t, 'prismare'))) return 0;
	return applyAssignmentMultiplier(([0,.005,.010,.015,.020,.025][tier] ?? 0), 'prismare', resolveAssignment(t, a));
}

export function getMegabossLootBonus(u: Partial<IslandUpgradeTiers>, t?: IslandMaintenanceTimestamps, a?: AssignableCategory | null): number {
	const tier = getTier(u, 'megaboss');
	if (tier === 0 || (t && !isCategoryMaintained(t, 'megaboss'))) return 0;
	return applyAssignmentMultiplier(([0,0,.10,.20,.35,.50][tier] ?? 0), 'megaboss', resolveAssignment(t, a));
}