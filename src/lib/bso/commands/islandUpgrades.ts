import { Bank } from 'oldschooljs';

export type UpgradeCategory = 'boss' | 'megaboss' | 'minigame' | 'gathering' | 'prismare';

export interface UpgradeTier {
    tier: number;
    cost: Bank;
    name: string;
    description: string;
    bonus: string;
}

export const upgradeDefinitions: Record<UpgradeCategory, UpgradeTier[]> = {
    boss: [
        {
            tier: 1,
            cost: new Bank().add('Coins', 1_000_000_000).add('Colossal stem', 5000).add('Crystalline ore', 2000),
            name: 'Boss Efficiency I',
            description: 'Improves speed when killing island bosses',
            bonus: '5% faster kills'
        },
        {
            tier: 2,
            cost: new Bank().add('Coins', 2_000_000_000).add('Colossal stem', 15000).add('Crystalline ore', 5000).add('Dense crystal shard', 5000),
            name: 'Boss Efficiency II',
            description: '10% faster kills',
            bonus: '10% faster kills'
        },
        {
            tier: 3,
            cost: new Bank().add('Coins', 3_000_000_000).add('Ancient cap', 2000).add('Crystalline ore', 10000).add('Dense crystal shard', 15000),
            name: 'Boss Efficiency III',
            description: '15% faster kills',
            bonus: '15% faster kills'
        }
    ],
    megaboss: [
        {
            tier: 1,
            cost: new Bank().add('Coins', 1_000_000_000).add('Brimstone spore', 5000).add('Ignilace', 500),
            name: 'Megaboss I',
            description: 'Unlocks access to the Archon megaboss',
            bonus: 'Unlock Archon'
        },
        {
            tier: 2,
            cost: new Bank().add('Coins', 2_000_000_000).add('Brimstone spore', 5000).add('Ignilace', 150).add('Crystalline ore', 2000),
            name: 'Megaboss II',
            description: '10% better regular loot from the Archon',
            bonus: '10% better loot'
        },
        {
            tier: 3,
            cost: new Bank().add('Coins', 3_000_000_000).add('Ancient cap', 50).add('Ignilace', 10000).add('Dense crystal shard', 5000),
            name: 'Megaboss III',
            description: '20% better regular loot from the Archon',
            bonus: '20% better loot'
        }
    ],
    minigame: [
        {
            tier: 1,
            cost: new Bank().add('Coins', 1_000_000_000).add('Myconid plank', 3000).add('Diluted brimstone', 250),
            name: 'Minigame Boost I',
            description: 'Improves Construction Contracts and Brimstone Distillery rewards',
            bonus: '5% better rewards'
        },
        {
            tier: 2,
            cost: new Bank().add('Coins', 2_000_000_000).add('Myconid plank', 7000).add('Diluted brimstone', 1500).add('Brimstone spore', 2000),
            name: 'Minigame Boost II',
            description: '10% better rewards',
            bonus: '10% better rewards'
        },
        {
            tier: 3,
            cost: new Bank().add('Coins', 3_000_000_000).add('Crystalline plank', 10000).add('Diluted brimstone', 5000).add('Dense crystal shard', 5000),
            name: 'Minigame Boost III',
            description: '15% better rewards',
            bonus: '15% better rewards'
        }
    ],
    gathering: [
        {
            tier: 1,
            cost: new Bank().add('Coins', 1_000_000_000).add('Verdant logs', 5000).add('Living bark', 1000),
            name: 'Gathering Speed I',
            description: 'Speeds up Gemstone Fishing, Ancient Mycology, and Archaic Mining',
            bonus: '5% faster gathering'
        },
        {
            tier: 2,
            cost: new Bank().add('Coins', 2_000_000_000).add('Verdant logs', 10000).add('Living bark', 2500).add('Ancient verdant logs', 5000),
            name: 'Gathering Speed II',
            description: '10% faster gathering',
            bonus: '10% faster gathering'
        },
        {
            tier: 3,
            cost: new Bank().add('Coins', 3_000_000_000).add('Ancient verdant logs', 1500).add('Living bark', 4000).add('Verdant plank', 2000),
            name: 'Gathering Speed III',
            description: '15% faster gathering',
            bonus: '15% faster gathering'
        }
    ],
    prismare: [
        {
            tier: 1,
            cost: new Bank().add('Coins', 1_000_000_000).add('Prismare', 10).add('Celestyte', 50).add('Firaxyte', 30),
            name: 'Prismare Enhancement I',
            description: 'Enhances the Prismare Ring XP boost',
            bonus: '+1% global XP'
        },
        {
            tier: 2,
            cost: new Bank().add('Coins', 2_000_000_000).add('Prismare', 50).add('Starfire agate', 500).add('Oneiryte', 300).add('Verdantyte', 300),
            name: 'Prismare Enhancement II',
            description: 'Enhances the Prismare Ring',
            bonus: '+2% global XP'
        },
        {
            tier: 3,
            cost: new Bank().add('Coins', 3_000_000_000).add('Prismare', 100).add('Celestyte', 10).add('Firaxyte', 500),
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

export function getTier(userUpgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): number {
    return (userUpgrades?.[category] ?? 0) as number;
}

export function getNextUpgradeForCategory(userUpgrades: Partial<IslandUpgradeTiers>, category: UpgradeCategory): UpgradeTier | null {
    const current = getTier(userUpgrades, category);
    const tiers = upgradeDefinitions[category];
    return tiers.find(t => t.tier === current + 1) ?? null;
}

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
    return [0, 0, 0.10, 0.20][tier] ?? 0;
}