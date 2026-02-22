import type { ButtonBuilder } from '@oldschoolgg/discord';
import { randInt, roll } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, itemID } from 'oldschooljs';

import type { ArchonOptions } from '@/lib/bso/bsoTypes.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { makeArchonButton } from '@/lib/util/interactions.js';
import {
    getBossSpeedBonus,
    getMegabossLootBonus,
    getTier,
    defaultIslandUpgrades,
    type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

export const archonPresentations = {
    1: {
        name: 'Shrouded Archon',
        flavourStart: `The air grows cold as a dark silhouette emerges from the void. The **Shrouded Archon** has noticed your minion.`,
        flavourEnd: `The shadow falls, its form collapsing into darkness before your minion. Your minion stands victorious.`
    },
    2: {
        name: 'Ascendant Archon',
        flavourStart: `The ground trembles as blinding light tears through skies. The **Ascendant Archon** descends upon your minion from the heavens.`,
        flavourEnd: `Its radiance fades. The Ascendant Archon's form crumbles, its power spent. Your minion endures.`
    },
    3: {
        name: 'Apotheotic Archon',
        flavourStart: `The world itself seems to recoil and tremble. Something vast and terrible turns its full attention toward your minion from a greater plane. The **Apotheotic Archon** has arrived.`,
        flavourEnd: `Silence. For a moment, the world seems uncertain if it will begin turning again. Then, it breathes. The Apotheotic Archon is no more.`
    }
} as const;

export function getArchonTier(_user: MUser): 1 | 2 | 3 | null {
    return 3; // temporary 
}

const meleeSlots: [string, number][] = [
    ['Axe of the high sungod', 30], 
    ['Empyrean greathelm', 10],
    ['Empyrean greatplate', 12],
    ['Empyrean greatgreaves', 12],
    ['Empyrean greatgauntlets', 8],
    ['Empyrean greatsabaton', 8],
    ['Brawler\'s hook necklace', 10],
    ['Searcrown band', 5],
    ['TzKal cape', 3],
    ['Vitrolic curse', 2], 
];

const rangedSlots: [string, number][] = [
    ['Elderflame bow', 35], 
    ['Elderflame arrow', 20],    
    ['Tidal collector (i)', 8],
    ['Farsight snapshot necklace', 8],
    ['Ring of piercing (i)', 5],
    ['Gorajan archer helmet', 5],
    ['Gorajan archer top', 6],
    ['Gorajan archer legs', 6],
    ['Gorajan archer gloves', 3],
    ['Gorajan archer boots', 4],
];

const mageSlots: [string, number][] = [
    ['Void staff', 30],
    ['Abyssal tome', 15],
    ['Arcane blast necklace', 10],
    ['Spellbound ring (i)', 5],
    ['Vasa cloak', 8],
    ['Gorajan occult helmet', 7],
    ['Gorajan occult top', 8],
    ['Gorajan occult legs', 8],
    ['Gorajan occult gloves', 5],
    ['Gorajan occult boots', 4],
];

const tierGearPenalty: Record<1 | 2 | 3, { floor: number; ceiling: number }> = {
    1: { floor: 0.40, ceiling: 1.0 },
    2: { floor: 0.25, ceiling: 1.0 },
    3: { floor: 0.10, ceiling: 1.0 },
};

function scoreGearSlots(user: MUser, slots: [string, number][]): number {
    let score = 0;
    let total = 0;
    for (const [item, points] of slots) {
        total += points;
        try {
            if (user.hasEquippedOrInBank(item)) score += points;
        } catch {
        }
    }
    return total > 0 ? (score / total) * 100 : 0;
}

export function calcArchonContribution(user: MUser, totalUsers: number): {
    percent: number;
    boostMessages: string[];
    gearScore: number;
} {
    const boostMessages: string[] = [];

    const rangedGearScore = scoreGearSlots(user, rangedSlots);
    const meleeGearScore = scoreGearSlots(user, meleeSlots);
    const mageGearScore = scoreGearSlots(user, mageSlots);

    const rawGearScore = (rangedGearScore * 0.50) + (meleeGearScore * 0.25) + (mageGearScore * 0.25);

    const groupScaling = 1 / Math.sqrt(totalUsers);
    const totalContribution = rawGearScore * groupScaling;

    boostMessages.push(
        `Gear score: **${rawGearScore.toFixed(1)}%** (Ranged: ${rangedGearScore.toFixed(1)}%, Melee: ${meleeGearScore.toFixed(1)}%, Mage: ${mageGearScore.toFixed(1)}%)`
    );
    boostMessages.push(
        `Group contribution: **${totalContribution.toFixed(1)}%** (${totalUsers} adventurers)`
    );

    return { percent: totalContribution, boostMessages, gearScore: rawGearScore };
}

const archonEligibleMonsterIDs = [
    142_001, // Orym
    142_002, // Orrodil
    142_003, // Crystalline Sentinel
    142_004, // Fungal Behemoth
    142_005, // Elder Mimic
    142_006, // Burning Dominion
];

const activitiesCanSpawnArchon = [
    'MonsterKilling',
    'GroupMonsterKilling',
    'BrimstoneDistillery',
    'ConstructionContracts',
    'AncientMycology',
    'ArchaicMining',
    'GemstoneFishing'
];

export async function handleTriggerArchon(
    user: MUser,
    data: ActivityTaskData,
    components: ButtonBuilder[]
) {
    if (!activitiesCanSpawnArchon.includes(data.type)) return;

    if (data.type === 'MonsterKilling' || data.type === 'GroupMonsterKilling') {
        if (!('mi' in data) || !archonEligibleMonsterIDs.includes(data.mi as number)) return;
    }

    const tier = getArchonTier(user);
    if (tier === null) return;
    const minutes = Math.floor(data.duration / Time.Minute);
    if (minutes < 1) return;

    await prisma.archonEvent.create({
        data: {
            user_id: user.id,
            tier,
            expires_at: new Date(Date.now() + Time.Minute * 10),
            has_been_done: false
        }
    });

    components.push(makeArchonButton(tier));
}

export async function archonCommand(
    channelId: string,
    user: MUser,
    archonEvent: { tier: number }
): Promise<string> {
    if (await user.minionIsBusy()) return 'Your minion is busy.';
    const tier = archonEvent.tier as 1 | 2 | 3;
    const presentation = archonPresentations[tier];

    const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
    const megabossTier = getTier(islandUpgrades, 'megaboss');
    if (megabossTier < 1) {
        return `Your minion doesn't yet know how to find the Archon. Contribute to **Archon Sanctum I** from \`/islandupgrade contribute\` to unlock access.`;
    }

    const userList: string[] = [user.id];
    const numDummies = randInt(10, 50);
    for (let i = 0; i < numDummies; i++) {
        userList.push(String(randInt(100_000_000_000_000, 999_999_999_999_999)));
    }

    const { percent: contribution, boostMessages, gearScore } = calcArchonContribution(user, userList.length);

    const speedReduction = (contribution / 100) * 0.30;

    const islandSpeedBonus = getBossSpeedBonus(islandUpgrades);
    if (islandSpeedBonus > 0) {
        boostMessages.push(`Warcamp Fortifications: **${(islandSpeedBonus * 100).toFixed(0)}%** faster`);
    }

    const lootBonus = getMegabossLootBonus(islandUpgrades);
    if (lootBonus > 0) {
        boostMessages.push(`Archon Sanctum: **+${(lootBonus * 100).toFixed(0)}%** loot (uniques unaffected)`);
    }

    const baseDuration = {
        1: Time.Minute * 5,
        2: Time.Minute * 10,
        3: Time.Minute * 20
    }[tier];

    const duration = Math.floor(baseDuration * (1 - speedReduction) * (1 - islandSpeedBonus));

    const ELDERFLAME_ARROW_ID = itemID('Elderflame arrow');
    const arrowsPerKill: Record<1 | 2 | 3, number> = { 1: 50, 2: 100, 3: 200 };
    const arrowsNeeded = arrowsPerKill[tier];
    const hasArrows = user.bank.amount(ELDERFLAME_ARROW_ID) >= arrowsNeeded;

    if (!hasArrows) {
        return `Your minion needs at least **${arrowsNeeded}x Elderflame arrows** to fight the ${presentation.name}.`;
    }

    await user.removeItemsFromBank(new Bank().add(ELDERFLAME_ARROW_ID, arrowsNeeded));

    await ActivityManager.startTrip({
        userID: user.id,
        channelId,
        duration,
        type: 'Archon' as const,
        tier,
        isSolo: true,
        contribution,
        gearScore,
        quantity: 1,
        users: userList,
        bossUsers: [{
            user: user.id,
            userPercentChange: contribution,
            deathChance: 0,
            itemsToRemove: {},
            debugStr: `solo archon tier:${tier} contribution:${contribution.toFixed(1)}% gear:${gearScore.toFixed(1)}% group:${userList.length}`
        }],
        bossID: 0
    } as unknown as ArchonOptions);

    const boostStr = boostMessages.length > 0 ? `\n\n**Boosts:**\n${boostMessages.join('\n')}` : '';

    return [
        presentation.flavourStart,
        ``,
        `${user.minionName} and ${numDummies} other adventurers charge into battle! The trip will take **${formatDuration(duration)}**.`,
        boostStr
    ].join('\n');
}

const tier1Uniques = ['Prismare ring (u)'];
const tier2Uniques = ['Prismare ring (u)'];
const tier3Uniques = ['Prismare ring (u)'];

export function getUniquesForTier(tier: 1 | 2 | 3): string[] {
    return { 1: tier1Uniques, 2: tier2Uniques, 3: tier3Uniques }[tier];
}

export { tierGearPenalty };

export function rollArchonLoot(tier: 1 | 2 | 3, multiplier = 1.0): {
    regularLoot: Bank;
    uniqueLoot: Bank;
} {
    const regularLoot = new Bank();
    const uniqueLoot = new Bank();

    const baseShards = { 1: randInt(2, 5), 2: randInt(4, 10), 3: randInt(6, 15) }[tier];
    regularLoot.add('Empyrean shards', Math.floor(baseShards * multiplier));

    if (roll({ 1: 20, 2: 15, 3: 10 }[tier])) {
        regularLoot.add('Empyrean shards', randInt(5, 25));
    }

    const elderLogAmounts = { 1: randInt(1, 5), 2: randInt(3, 12), 3: randInt(8, 25) }[tier];
    if (roll(3)) regularLoot.add('Elder logs', Math.floor(elderLogAmounts * multiplier));

    const elderRuneAmounts = { 1: randInt(5, 15), 2: randInt(10, 30), 3: randInt(20, 60) }[tier];
    if (roll(3)) regularLoot.add('Elder rune', Math.floor(elderRuneAmounts * multiplier));

    const elderPlankAmounts = { 1: randInt(1, 3), 2: randInt(2, 8), 3: randInt(5, 15) }[tier];
    if (roll(4)) regularLoot.add('Elder plank', Math.floor(elderPlankAmounts * multiplier));

    if (roll({ 1: 100, 2: 75, 3: 50 }[tier])) {
        regularLoot.add('Elder scroll piece');
    }

    if (roll({ 1: 50, 2: 35, 3: 20 }[tier])) {
        const piece = randInt(1, 3) as 1 | 2 | 3;
        regularLoot.add(`Elder sigil fragment (${piece})`);
    }

    const coinAmounts = {
        1: randInt(50_000, 200_000),
        2: randInt(500_000, 2_000_000),
        3: randInt(5_000_000, 20_000_000)
    }[tier];
    regularLoot.add('Coins', Math.floor(coinAmounts * multiplier));

    if (tier === 1) {
        if (roll(300)) uniqueLoot.add('Prismare ring (u)');
    } else if (tier === 2) {
        if (roll(200)) uniqueLoot.add('Prismare ring (u)');
    } else {
        if (roll(100)) uniqueLoot.add('Prismare ring (u)');
    }

    return { regularLoot, uniqueLoot };
}