import { Bank } from 'oldschooljs';

export type UpgradeCategory = 'boss' | 'megaboss' | 'minigame' | 'gathering' | 'prismare';

export interface UpgradeTier {
	tier: number;
	cost: Bank;
	name: string;
	description: string;
	bonus: string;
	flavorText: string;
}

export interface UpgradeCategoryMeta {
	label: string;
	locationName: string;
	flavorIntro: string;
}

export const upgradeCategoryMeta: Record<UpgradeCategory, UpgradeCategoryMeta> = {
	boss: {
		label: 'Warcamp Fortifications',
		locationName: 'the Warcamp',
		flavorIntro: 'Reinforce the warcamp\'s walls and arm the garrison.'
	},
	megaboss: {
		label: 'Archon Sanctum',
		locationName: 'the Archon Sanctum',
		flavorIntro: 'Construct the ritual sanctum and open a path to the Archon.'
	},
	minigame: {
		label: 'Settlement Infrastructure',
		locationName: 'the Settlement',
		flavorIntro: 'Develop the settlement\'s facilities to support all camp operations.'
	},
	gathering: {
		label: 'Expedition Outfitters',
		locationName: 'the Outfitters\' Lodge',
		flavorIntro: 'Equip crews with better tools to gather faster.'
	},
	prismare: {
		label: 'Astral Observatory',
		locationName: 'the Astral Observatory',
		flavorIntro: 'Expand the observatory and attune it to the Prismare Ring\'s energies.'
	}
};

export const upgradeDefinitions: Record<UpgradeCategory, UpgradeTier[]> = {
	boss: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins', 1_000_000_000)
				.add('Colossal stem', 5_000)
				.add('Crystalline ore', 2_000)
				.add('Iron ore', 20_000)
				.add('Coal', 40_000)
				.add('Cannonball', 25_000),
			name: 'Warcamp Fortifications I',
			description: 'Palisade walls reinforced, cannon emplacements installed.',
			bonus: '5% faster boss kills',
			flavorText: 'Iron and coal. The basics.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins', 2_000_000_000)
				.add('Colossal stem', 15_000)
				.add('Crystalline ore', 5_000)
				.add('Dense crystal shard', 5_000)
				.add('Adamantite ore', 30_000)
				.add('Runite ore', 40_000)
				.add('Battlestaff', 15_000),
			name: 'Warcamp Fortifications II',
			description: 'Armoury stocked with runite. Battlemages posted to the walls.',
			bonus: '10% faster boss kills',
			flavorText: 'Runite and battle staves. The garrison grows stronger.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins', 3_000_000_000)
				.add('Ancient cap', 2_000)
				.add('Crystalline ore', 10_000)
				.add('Dense crystal shard', 15_000)
				.add('Runite bar', 20_000)
				.add('Amethyst', 25_000)
				.add('Blue dragon scale', 20_000),
			name: 'Warcamp Fortifications III',
			description: 'Elite warriors equipped with dragonscale armour and amethyst ammo.',
			bonus: '15% faster boss kills',
			flavorText: 'Dragonscale and amethyst. Few enemies stand in the way.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins', 4_000_000_000)
				.add('Ancient cap', 4_000)
				.add('Crystalline ore', 20_000)
				.add('Dense crystal shard', 30_000)
				.add('Runite bar', 50_000)
				.add('Amethyst', 50_000)
				.add('Blue dragon scale', 30_000)
				.add('Blue dragonhide', 5_000)
				.add('Sentinel core', 3),
			name: 'Warcamp Fortifications IV',
			description: 'Sentinel cores embedded in the command post grant real time island awareness.',
			bonus: '20% faster boss kills',
			flavorText: 'The sentinel cores see everything. Teams grow more aware.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins', 5_000_000_000)
				.add('Ancient cap', 8_000)
				.add('Crystalline ore', 40_000)
				.add('Dense crystal shard', 60_000)
				.add('Runite bar', 80_000)
				.add('Amethyst', 100_000)
				.add('Blue dragon scale', 30_000)
				.add('Blue dragonhide', 15_000)
				.add('Sentinel core', 4),
			name: 'Warcamp Fortifications V',
			description: 'A fully fortified war machine. No beast on the island is safe.',
			bonus: '25% faster boss kills',
			flavorText: 'The warcamp is complete. The island is yours.'
		}
	],

	megaboss: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins', 1_000_000_000)
				.add('Brimstone spore', 5_000)
				.add('Ignilace', 500)
				.add('Pure essence', 250_000)
				.add('Air rune', 100_000)
				.add('Mind rune', 100_000),
			name: 'Archon Sanctum I',
			description: 'Foundation stones laid, first ritual performed. The Archon stirs.',
			bonus: 'Unlocks access to the Archon',
			flavorText: 'Brimstone and rune etched stones. Something stirs beneath the island.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins', 2_000_000_000)
				.add('Brimstone spore', 5_000)
				.add('Ignilace', 150)
				.add('Crystalline ore', 2_000)
				.add('Nature rune', 60_000)
				.add('Law rune', 40_000)
				.add('Death rune', 100_000),
			name: 'Archon Sanctum II',
			description: 'Ritual circles reinforced with law and death runes.',
			bonus: '10% better regular loot from the Archon',
			flavorText: 'Steady light fills the circles. The Archon gives more freely now.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins', 3_000_000_000)
				.add('Ancient cap', 50)
				.add('Ignilace', 10_000)
				.add('Dense crystal shard', 5_000)
				.add('Blood rune', 30_000)
				.add('Soul rune', 30_000)
				.add('Death rune', 200_000),
			name: 'Archon Sanctum III',
			description: 'Blood and soul runes saturate the walls. The Archon\'s hoard is more accessible.',
			bonus: '20% better regular loot from the Archon',
			flavorText: 'Soul runes line every surface. Nothing the Archon holds can stay hidden.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins', 4_000_000_000)
				.add('Ancient cap', 250)
				.add('Ignilace', 30_000)
				.add('Dense crystal shard', 12_000)
				.add('Blood rune', 80_000)
				.add('Soul rune', 40_000)
				.add('Pure essence', 250_000)
				.add('Sentinel core', 4),
			name: 'Archon Sanctum IV',
			description: 'Sentinel cores woven into the apex open a direct line to the Archon\'s hoard.',
			bonus: '35% better regular loot from the Archon',
			flavorText: 'Four cores crown the sanctum. The Archon has no secrets left.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins', 5_000_000_000)
				.add('Ancient cap', 750)
				.add('Ignilace', 60_000)
				.add('Dense crystal shard', 25_000)
				.add('Blood rune', 150_000)
				.add('Soul rune', 75_000)
				.add('Pure essence', 500_000)
				.add('Sentinel core', 4)
				.add('Verdant heart', 3),
			name: 'Archon Sanctum V',
			description: 'Verdant hearts power the sanctum. The Archon yields everything.',
			bonus: '50% better regular loot from the Archon',
			flavorText: 'The sanctum is complete. The Archon has nowhere left to hide.'
		}
	],

	minigame: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins', 1_000_000_000)
				.add('Myconid plank', 3_000)
				.add('Diluted brimstone', 250)
				.add('Yew logs', 30_000)
				.add('Flax', 40_000)
				.add('Swamp paste', 20_000),
			name: 'Settlement Infrastructure I',
			description: 'First permanent structures built. Workers now have shelter and morale.',
			bonus: '5% better minigame rewards',
			flavorText: 'Yew timber and flax daub. Rough, but it\'s a start.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins', 2_000_000_000)
				.add('Myconid plank', 7_000)
				.add('Diluted brimstone', 1_500)
				.add('Brimstone spore', 2_000)
				.add('Magic logs', 15_000)
				.add('Grapes', 40_000)
				.add('Snape grass', 10_000),
			name: 'Settlement Infrastructure II',
			description: 'A tavern, a distillery, and a marketplace raise settlement morale.',
			bonus: '10% better minigame rewards',
			flavorText: 'Spirits on the house. Morale has never been higher.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins', 3_000_000_000)
				.add('Crystalline plank', 10_000)
				.add('Diluted brimstone', 5_000)
				.add('Dense crystal shard', 5_000)
				.add('Mort myre fungus', 20_000)
				.add('Raw rocktail', 15_000)
				.add('Feather', 100_000),
			name: 'Settlement Infrastructure III',
			description: 'An alchemical quarter and trade stalls draw rare goods through the settlement.',
			bonus: '15% better minigame rewards',
			flavorText: 'Mort myre fungus and rocktail smoke. Traders are finding their way here.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins', 4_000_000_000)
				.add('Crystalline plank', 25_000)
				.add('Diluted brimstone', 12_000)
				.add('Dense crystal shard', 12_000)
				.add('Feather', 200_000)
				.add('Raw rocktail', 35_000)
				.add('Battlestaff', 30_000)
				.add('Sentinel core', 4),
			name: 'Settlement Infrastructure IV',
			description: 'Sentinel cores automate defense across the entire settlement.',
			bonus: '20% better minigame rewards',
			flavorText: 'Four cores beneath the plaza. The settlement practically runs itself.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins', 5_000_000_000)
				.add('Crystalline plank', 50_000)
				.add('Diluted brimstone', 25_000)
				.add('Dense crystal shard', 25_000)
				.add('Feather', 450_000)
				.add('Raw rocktail', 70_000)
				.add('Battlestaff', 75_000)
				.add('Dragonstone', 20_000)
				.add('Verdant heart', 3),
			name: 'Settlement Infrastructure V',
			description: 'Dragonstone halls and verdant heart conduits. A city in the wilderness.',
			bonus: '25% better minigame rewards',
			flavorText: 'This is a city now.'
		}
	],

	gathering: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins', 1_000_000_000)
				.add('Verdant logs', 5_000)
				.add('Living bark', 1_000)
				.add('Elder logs', 60_000)
				.add('Iron ore', 20_000)
				.add('Coal', 40_000),
			name: 'Expedition Outfitters I',
			description: 'First crews outfitted with iron tools and elder log sleds.',
			bonus: '5% faster gathering',
			flavorText: 'Slow but steady, the carts are filling up.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins', 2_000_000_000)
				.add('Verdant logs', 10_000)
				.add('Living bark', 2_500)
				.add('Ancient verdant logs', 5_000)
				.add('Elder logs', 120_000)
				.add('Adamantite ore', 60_000)
				.add('Runite ore', 80_000),
			name: 'Expedition Outfitters II',
			description: 'Upgraded to adamant and runite tools with ancient verdant sleds.',
			bonus: '10% faster gathering',
			flavorText: 'Runite tools and ancient sleds. The terrain doesn\'t slow them anymore.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins', 3_000_000_000)
				.add('Ancient verdant logs', 1_500)
				.add('Living bark', 4_000)
				.add('Verdant plank', 2_000)
				.add('Elder logs', 120_000)
				.add('Runite bar', 60_000)
				.add('Dragonstone', 15_000),
			name: 'Expedition Outfitters III',
			description: 'Dragonstone gathering frames push expedition efficiency yet further.',
			bonus: '15% faster gathering',
			flavorText: 'The wilderness doesn\'t halt them.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins', 4_000_000_000)
				.add('Ancient verdant logs', 4_000)
				.add('Living bark', 8_000)
				.add('Verdant plank', 5_000)
				.add('Elder logs', 200_000)
				.add('Runite bar', 120_000)
				.add('Dragonstone', 30_000)
				.add('Amethyst', 25_000)
				.add('Sentinel core', 4),
			name: 'Expedition Outfitters IV',
			description: 'Sentinel cores take crews to the richest resources.',
			bonus: '20% faster gathering',
			flavorText: 'Nobody idles anymore.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins', 5_000_000_000)
				.add('Ancient verdant logs', 8_000)
				.add('Living bark', 15_000)
				.add('Verdant plank', 10_000)
				.add('Elder logs', 300_000)
				.add('Runite bar', 150_000)
				.add('Dragonstone', 50_000)
				.add('Amethyst', 50_000)
				.add('Sentinel core', 4)
				.add('Verdant heart', 3),
			name: 'Expedition Outfitters V',
			description: 'Verdant hearts bond the rigs to the island itself, maximising yields.',
			bonus: '25% faster gathering',
			flavorText: 'The island gives freely now.'
		}
	],

	prismare: [
		{
			tier: 1,
			cost: new Bank()
				.add('Coins', 1_000_000_000)
				.add('Prismare', 10)
				.add('Celestyte', 50)
				.add('Firaxyte', 30)
				.add('Air rune', 100_000)
				.add('Mind rune', 100_000)
				.add('Pure essence', 250_000),
			name: 'Astral Observatory I',
			description: 'Observatory dome raised, the first instruments calibrated.',
			bonus: '+1% global XP',
			flavorText: 'The prismare shard levitates and spins. The scholars are sleeping less.'
		},
		{
			tier: 2,
			cost: new Bank()
				.add('Coins', 2_000_000_000)
				.add('Prismare', 50)
				.add('Starfire agate', 500)
				.add('Oneiryte', 300)
				.add('Verdantyte', 300)
				.add('Nature rune', 60_000)
				.add('Law rune', 40_000)
				.add('Death rune', 100_000),
			name: 'Astral Observatory II',
			description: 'Starfire agate lenses and oneiryte channels focus the observatory.',
			bonus: '+2% global XP',
			flavorText: 'Oneiryte dust in the air.'
		},
		{
			tier: 3,
			cost: new Bank()
				.add('Coins', 3_000_000_000)
				.add('Prismare', 100)
				.add('Celestyte', 10)
				.add('Firaxyte', 500)
				.add('Blood rune', 30_000)
				.add('Soul rune', 30_000)
				.add('Death rune', 200_000),
			name: 'Astral Observatory III',
			description: 'Firaxyte cores ignite, flooding the island with ambient glow.',
			bonus: '+3% global XP',
			flavorText: 'A warm glow visible for miles. Everything on the island feels sharper.'
		},
		{
			tier: 4,
			cost: new Bank()
				.add('Coins', 4_000_000_000)
				.add('Prismare', 200)
				.add('Celestyte', 500)
				.add('Firaxyte', 1_500)
				.add('Starfire agate', 2_000)
				.add('Oneiryte', 1_000)
				.add('Blood rune', 80_000)
				.add('Soul rune', 40_000)
				.add('Pure essence', 250_000)
				.add('Sentinel core', 4),
			name: 'Astral Observatory IV',
			description: 'Sentinel cores synchronise all instruments into a unified array.',
			bonus: '+4% global XP',
			flavorText: 'The hum is constant now.'
		},
		{
			tier: 5,
			cost: new Bank()
				.add('Coins', 5_000_000_000)
				.add('Prismare', 500)
				.add('Celestyte', 2_000)
				.add('Firaxyte', 5_000)
				.add('Starfire agate', 5_000)
				.add('Oneiryte', 3_000)
				.add('Verdantyte', 3_000)
				.add('Blood rune', 150_000)
				.add('Soul rune', 75_000)
				.add('Pure essence', 500_000)
				.add('Sentinel core', 4)
				.add('Verdant heart', 3)
				.add('Dragonstone', 25_000),
			name: 'Astral Observatory V',
			description: 'Prismare Resonance achieved.',
			bonus: '+5% global XP',
			flavorText: 'The orrery spins alone.'
		}
	]
};

export type IslandUpgradeTiers = {
	boss: number;
	megaboss: number;
	minigame: number;
	gathering: number;
	prismare: number;
};

export type IslandUpgradeContributions = {
	boss: Partial<Record<string, number>>;
	megaboss: Partial<Record<string, number>>;
	minigame: Partial<Record<string, number>>;
	gathering: Partial<Record<string, number>>;
	prismare: Partial<Record<string, number>>;
};

export const defaultIslandUpgrades: IslandUpgradeTiers = {
	boss: 0,
	megaboss: 0,
	minigame: 0,
	gathering: 0,
	prismare: 0
};

export const defaultIslandContributions: IslandUpgradeContributions = {
	boss: {},
	megaboss: {},
	minigame: {},
	gathering: {},
	prismare: {}
};

export function getTier(userUpgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): number {
	return (userUpgrades?.[category] ?? 0) as number;
}

export function getNextUpgradeForCategory(
	userUpgrades: Partial<IslandUpgradeTiers>,
	category: UpgradeCategory
): UpgradeTier | null {
	const current = getTier(userUpgrades, category);
	const tiers = upgradeDefinitions[category];
	return tiers.find(t => t.tier === current + 1) ?? null;
}

export function getContributionProgress(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): number {
	const costItems = nextUpgrade.cost.items();
	const totalCostItems = costItems.reduce((sum: number, [, quantity]: [unknown, number]) => sum + quantity, 0);
	if (totalCostItems === 0) return 0;

	let totalContributed = 0;
	for (const [item, quantity] of costItems) {
		const contributed = Math.min(contributions[item.id.toString()] ?? 0, quantity);
		totalContributed += contributed;
	}

	return Math.floor((totalContributed / totalCostItems) * 100);
}

export function isContributionComplete(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): boolean {
	for (const [item, quantity] of nextUpgrade.cost.items()) {
		const contributed = contributions[item.id.toString()] ?? 0;
		if (contributed < quantity) return false;
	}
	return true;
}

export function getRemainingCost(
	nextUpgrade: UpgradeTier,
	contributions: Partial<Record<string, number>>
): Bank {
	const remaining = new Bank();
	for (const [item, quantity] of nextUpgrade.cost.items()) {
		const contributed = contributions[item.id.toString()] ?? 0;
		const stillNeeded = quantity - contributed;
		if (stillNeeded > 0) {
			remaining.add(item.id, stillNeeded);
		}
	}
	return remaining;
}

export function getBossSpeedBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
	const tier = getTier(userUpgrades, 'boss');
	return [0, 0.05, 0.10, 0.15, 0.20, 0.25][tier] ?? 0;
}

export function getMinigameRewardBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
	const tier = getTier(userUpgrades, 'minigame');
	return [0, 0.05, 0.10, 0.15, 0.20, 0.25][tier] ?? 0;
}

export function getGatheringSpeedBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
	const tier = getTier(userUpgrades, 'gathering');
	return [0, 0.05, 0.10, 0.15, 0.20, 0.25][tier] ?? 0;
}

export function getPrismareXPBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
	const tier = getTier(userUpgrades, 'prismare');
	return [0, 0.01, 0.02, 0.03, 0.04, 0.05][tier] ?? 0;
}

export function getMegabossLootBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
	const tier = getTier(userUpgrades, 'megaboss');
	return [0, 0, 0.10, 0.20, 0.35, 0.50][tier] ?? 0;
}