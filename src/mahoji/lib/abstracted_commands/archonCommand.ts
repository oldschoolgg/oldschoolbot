import type { ButtonBuilder } from '@oldschoolgg/discord';
import { randInt, roll } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

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

//const TIER_1_XP = 80_618_654;
//const TIER_2_XP = 200_000_000;
//const TIER_3_XP = 5_000_000_000;
//const combatSkills = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints'] as const;

export function getArchonTier(_user: MUser): 1 | 2 | 3 | null {
    return 3; // temporary 
}

// export function getArchonTier(user: MUser): 1 | 2 | 3 | null {
//     const highestXp = Math.max(...combatSkills.map(s => user.skillsAsXP[s] ?? 0));
//     if (highestXp >= TIER_3_XP) return 3;
//     if (highestXp >= TIER_2_XP) return 2;
//     if (highestXp >= TIER_1_XP) return 1;
//     return null;
// }

const meleeSlots: [string, number][] = [
    ['Axe of the high sungod', 30], 
    ['Gorajan warrior helmet', 10],
    ['Gorajan warrior top', 12],
    ['Gorajan warrior legs', 12],
    ['Gorajan warrior gloves', 8],
    ['Gorajan warrior boots', 8],
    ['Brawler\'s hook necklace', 10],
    ['Searcrown band', 5],
    ['TzKal cape', 3],
    ['Vitriolic curse', 2], 
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
    ['Void staff', 30],                   // weapon — highest weight
    ['Abyssal tome', 15],                 // offhand
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

    let bowScore = 0;
    let bowMessage = '';

    try {
        const hasElderflameBow = user.hasEquippedOrInBank('Elderflame bow');
        const hasElderflameArrow = user.hasEquippedOrInBank('Elderflame arrow');
        const hasStarfireBow = user.hasEquippedOrInBank('Starfire bow');
        const hasHellfireArrow = user.hasEquippedOrInBank('Hellfire arrow');
        const hasHellfireBow = user.hasEquippedOrInBank('Hellfire bow');

        if (hasElderflameBow && hasElderflameArrow) {
            bowScore = 100;
            bowMessage = 'Elderflame bow & arrows equipped.';
        } else if (hasElderflameBow && !hasElderflameArrow) {
            bowScore = 50;
            bowMessage = 'Elderflame bow equipped but missing Elderflame arrows, using weaker ammo.';
        } else if (hasStarfireBow && hasHellfireArrow) {
            bowScore = 60;
            bowMessage = 'Using Starfire bow & Hellfire arrows, significantly weaker than Elderflame.';
        } else if (hasHellfireBow) {
            bowScore = 30;
            bowMessage = 'Using Hellfire bow, heavily penalised. Obtain an Elderflame bow for full effectiveness.';
        } else {
            bowScore = 0;
            bowMessage = 'No viable ranged weapon found, contribution is severely reduced.';
        }
    } catch {
        bowScore = 0;
        bowMessage = 'Ranged weapon check failed, items may not exist yet.';
    }

    boostMessages.push(bowMessage);

    const rangedSlotsWithoutBow = rangedSlots.filter(
        ([item]) => item !== 'Elderflame bow' && item !== 'Elderflame arrow'
    );
    const rangedGearScore = scoreGearSlots(user, rangedSlotsWithoutBow);
    const meleeGearScore = scoreGearSlots(user, meleeSlots);
    const mageGearScore = scoreGearSlots(user, mageSlots);


    const effectiveRangedScore = (bowScore * 0.55) + (rangedGearScore * 0.45);

    const rawGearScore = (effectiveRangedScore * 0.50) + (meleeGearScore * 0.25) + (mageGearScore * 0.25);

    const groupScaling = 1 / Math.sqrt(totalUsers);
    const totalContribution = rawGearScore * groupScaling;

    boostMessages.push(
        `📊 Gear score: **${rawGearScore.toFixed(1)}%** (Ranged: ${effectiveRangedScore.toFixed(1)}%, Melee: ${meleeGearScore.toFixed(1)}%, Mage: ${mageGearScore.toFixed(1)}%)`
    );
    boostMessages.push(
        `👥 Group contribution: **${totalContribution.toFixed(1)}%** (${totalUsers} adventurers)`
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

    // const baseChance = Math.floor(540 / minutes);
    // if (!roll(baseChance)) return;

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
    const tier = archonEvent.tier as 1 | 2 | 3;
    const presentation = archonPresentations[tier];

    const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
    const megabossTier = getTier(islandUpgrades, 'megaboss');
    if (megabossTier < 1) {
        return `Your minion doesn't yet know how to find the Archon. Purchase **Megaboss I** from \`/islandupgrade buy\` to unlock access.`;
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
        boostMessages.push(`Island Boss Efficiency: **${(islandSpeedBonus * 100).toFixed(0)}%** faster`);
    }

    const lootBonus = getMegabossLootBonus(islandUpgrades);
    if (lootBonus > 0) {
        boostMessages.push(`Island Megaboss: **+${(lootBonus * 100).toFixed(0)}%** loot (uniques unaffected)`);
    }

    const baseDuration = {
        1: Time.Minute * 5,
        2: Time.Minute * 10,
        3: Time.Minute * 20
    }[tier];

    const duration = Math.floor(baseDuration * (1 - speedReduction) * (1 - islandSpeedBonus));

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

    if (tier === 1) {
        regularLoot.add('Coins', Math.floor(randInt(50_000, 200_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(50 / multiplier)))) regularLoot.add('Dragon bones', randInt(1, 5));
        if (roll(150)) uniqueLoot.add('Prismare ring (u)');
    } else if (tier === 2) {
        regularLoot.add('Coins', Math.floor(randInt(500_000, 2_000_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(30 / multiplier)))) regularLoot.add('Dragon bones', randInt(5, 20));
        if (roll(300)) uniqueLoot.add('Prismare ring (u)');
    } else {
        regularLoot.add('Coins', Math.floor(randInt(5_000_000, 20_000_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(10 / multiplier)))) regularLoot.add('Dragon bones', randInt(20, 100));
        if (roll(512)) uniqueLoot.add('Prismare ring (u)');
    }

    return { regularLoot, uniqueLoot };
}