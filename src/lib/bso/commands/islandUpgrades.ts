import { Bank } from 'oldschooljs';

export type UpgradeCategory = 'boss' | 'megaboss' | 'minigame' | 'gathering' | 'prismare';

export interface UpgradeTier {
  tier: number; // 1..N
  cost: Bank;
  name: string;
  description: string;
  bonus: string;
}

export const upgradeDefinitions: Record<UpgradeCategory, UpgradeTier[]> = {
	boss: [
		{
			tier: 1,
			cost: new Bank().add('Colossal stem', 500).add('Crystalline ore', 200),
			name: 'Boss Efficiency I',
			description: 'Improves speed when killing island bosses',
			bonus: '5% faster kills'
		},
		{
			tier: 2,
			cost: new Bank().add('Colossal stem', 1500).add('Crystalline ore', 500).add('Dense crystal shard', 50),
			name: 'Boss Efficiency II',
			description: '10% faster kills',
			bonus: '10% faster kills'
		},
		{
			tier: 3,
			cost: new Bank().add('Ancient cap', 200).add('Crystalline ore', 1000).add('Dense crystal shard', 150),
			name: 'Boss Efficiency III',
			description: '15% faster kills',
			bonus: '15% faster kills'
		}
	],
	megaboss: [
		{
			tier: 1,
			cost: new Bank().add('Brimstone spore', 500).add('Ignilace', 50),
			name: 'Megaboss Access I',
			description: 'Unlocks access to the island megaboss',
			bonus: 'Unlock megaboss'
		},
		{
			tier: 2,
			cost: new Bank().add('Brimstone spore', 1500).add('Ignilace', 150).add('Crystalline ore', 200),
			name: 'Megaboss Access II',
			description: '10% better loot',
			bonus: '10% better loot'
		},
		{
			tier: 3,
			cost: new Bank().add('Ancient cap', 50).add('Ignilace', 300).add('Dense crystal shard', 100),
			name: 'Megaboss Access III',
			description: '20% better loot',
			bonus: '20% better loot'
		}
	],
	minigame: [
		{
			tier: 1,
			cost: new Bank().add('Myconid plank', 300).add('Diluted brimstone', 25),
			name: 'Minigame Boost I',
			description: 'Improves Construction Contracts and Brimstone Distillery rewards',
			bonus: '5% better rewards'
		},
		{
			tier: 2,
			cost: new Bank().add('Myconid plank', 700).add('Diluted brimstone', 50).add('Brimstone spore', 200),
			name: 'Minigame Boost II',
			description: '10% better rewards',
			bonus: '10% better rewards'
		},
		{
			tier: 3,
			cost: new Bank().add('Crystalline plank', 500).add('Diluted brimstone', 100).add('Dense crystal shard', 50),
			name: 'Minigame Boost III',
			description: '15% better rewards',
			bonus: '15% better rewards'
		}
	],
	gathering: [
		{
			tier: 1,
			cost: new Bank().add('Verdant logs', 500).add('Living bark', 100),
			name: 'Gathering Speed I',
			description: 'Speeds up Gemstone Fishing, Ancient Mycology, and Archaic Mining',
			bonus: '5% faster gathering'
		},
		{
			tier: 2,
			cost: new Bank().add('Verdant logs', 1500).add('Living bark', 250).add('Ancient verdant logs', 50),
			name: 'Gathering Speed II',
			description: '10% faster gathering',
			bonus: '10% faster gathering'
		},
		{
			tier: 3,
			cost: new Bank().add('Ancient verdant logs', 150).add('Living bark', 400).add('Verdant plank', 200),
			name: 'Gathering Speed III',
			description: '15% faster gathering',
			bonus: '15% faster gathering'
		}
	],
	prismare: [
		{
			tier: 1,
			cost: new Bank().add('Celestyte', 5).add('Firaxyte', 3),
			name: 'Prismare Enhancement I',
			description: 'Enhances the Prismare Ring XP boost',
			bonus: '+1% global XP'
		},
		{
			tier: 2,
			cost: new Bank().add('Starfire agate', 5).add('Oneiryte', 3).add('Verdantyte', 3),
			name: 'Prismare Enhancement II',
			description: 'Enhances the Prismare Ring',
			bonus: '+2% global XP'
		},
		{
			tier: 3,
			cost: new Bank().add('Prismare', 1).add('Celestyte', 10).add('Firaxyte', 5),
			name: 'Prismare Enhancement III',
			description: 'Maximum Prismare Ring power',
			bonus: '+3% global XP'
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

export const defaultIslandUpgrades: IslandUpgradeTiers = {
  boss: 0,
  megaboss: 0,
  minigame: 0,
  gathering: 0,
  prismare: 0
};

// helpers
export function getTier(userUpgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): number {
  return (userUpgrades?.[category] ?? 0) as number;
}

export function getNextUpgradeForCategory(userUpgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): UpgradeTier | null {
  const current = getTier(userUpgrades, category);
  const tiers = upgradeDefinitions[category];
  // find the tier whose .tier === current + 1
  const next = tiers.find(t => t.tier === current + 1) ?? null;
  return next;
}

// simple numeric bonus lookups (adjust the returned math for how you will apply the bonus)
export function getBossSpeedBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
  const tier = getTier(userUpgrades, 'boss');
  return [0, 0.05, 0.10, 0.15][tier] ?? 0;
}
export function getMinigameRewardBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
  const tier = getTier(userUpgrades, 'minigame');
  return [0, 0.05, 0.10, 0.15][tier] ?? 0;
}
export function getGatheringSpeedBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
  const tier = getTier(userUpgrades, 'gathering');
  return [0, 0.05, 0.10, 0.15][tier] ?? 0;
}
export function getPrismareXPBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
  const tier = getTier(userUpgrades, 'prismare');
  return [0, 0.01, 0.02, 0.03][tier] ?? 0;
}
export function getMegabossLootBonus(userUpgrades: Partial<IslandUpgradeTiers>): number {
    const tier = getTier(userUpgrades, 'megaboss');
    return [0, 0.10, 0.20, 0.30][tier] ?? 0;
}