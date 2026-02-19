import type { ButtonBuilder } from '@oldschoolgg/discord';
import { randInt, roll } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { ArchonOptions } from '@/lib/bso/bsoTypes.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { makeArchonButton } from '@/lib/util/interactions.js';
import {
    getBossSpeedBonus,
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
        flavourStart: `The world itself seems to recoil and tremble. Something vast and terrible turns its full attention toward your minon from a greater plane. The **Apotheotic Archon** has arrived.`,
        flavourEnd: `Silence. For a moment, the world seems uncertain if it will begin turning again. Then, it breathes. The Apotheotic Archon is no more.`
    }
} as const;

//const TIER_1_XP = 80_618_654;
//const TIER_2_XP = 200_000_000;
//const TIER_3_XP = 5_000_000_000;

//const combatSkills = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints'] as const;

export function getArchonTier(_user: MUser): 1 | 2 | 3 | null {
    return 3; // temporary — uncomment below when ready
}

// export function getArchonTier(user: MUser): 1 | 2 | 3 | null {
//     const highestXp = Math.max(...combatSkills.map(s => user.skillsAsXP[s] ?? 0));
//     if (highestXp >= TIER_3_XP) return 3;
//     if (highestXp >= TIER_2_XP) return 2;
//     if (highestXp >= TIER_1_XP) return 1;
//     return null;
// }

export function calcArchonContribution(user: MUser): {
    percent: number;
    boostMessages: string[];
} {
    const boostMessages: string[] = [];

    const hasElderflameBow = user.hasEquippedOrInBank('Elderflame bow');
    const hasElderflameArrows = user.hasEquippedOrInBank('Elderflame arrow');
    const hasElderflameCombo = hasElderflameBow && hasElderflameArrows;

    const rangedBase = hasElderflameCombo ? 100 : 40;
    const meleeBase = 100;
    const mageBase = 100; 

    if (!hasElderflameCombo) {
        if (!hasElderflameBow) boostMessages.push('Missing Elderflame bow — ranged contribution heavily reduced.');
        else boostMessages.push('Missing Elderflame arrows — ranged contribution heavily reduced.');
    } else {
        boostMessages.push('Elderflame bow & arrows equipped.');
    }

    // Weighted: ranged 50%, melee 25%, mage 25%
    const totalContribution = (rangedBase * 0.50) + (meleeBase * 0.25) + (mageBase * 0.25);

    boostMessages.push(
        `📊 Contribution: **${totalContribution.toFixed(1)}%** (Ranged: ${rangedBase}%, Melee: ${meleeBase}%, Mage: ${mageBase}%)`
    );

    return { percent: totalContribution, boostMessages };
}

const activitiesCantSpawnArchon = [
    'Archon',
    'ShootingStars',
    'FightCaves',
    'Inferno',
    'Nex',
    'TheatreOfBlood',
    'TombsOfAmascut',
    'Raids'
];

export async function handleTriggerArchon(
    user: MUser,
    data: ActivityTaskData,
    components: ButtonBuilder[]
) {
    if (activitiesCantSpawnArchon.includes(data.type)) return;

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

    // Build user list — real user at index 0, dummies after
    const userList: string[] = [user.id];
    const numDummies = randInt(10, 50);
    for (let i = 0; i < numDummies; i++) {
        userList.push(String(randInt(100_000_000_000_000, 999_999_999_999_999)));
    }

    // Base duration per presentation
    const baseDuration = {
        1: Time.Minute * 5,
        2: Time.Minute * 10,
        3: Time.Minute * 20
    }[tier];

    // Gear contribution reduces duration by up to 30%
    const { percent: contribution, boostMessages } = calcArchonContribution(user);
    const speedReduction = (contribution / 100) * 0.30;

    // Island upgrade speed bonus
    const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
    const islandSpeedBonus = getBossSpeedBonus(islandUpgrades);
    if (islandSpeedBonus > 0) {
        boostMessages.push(`🏝️ Island Boss Efficiency: **${(islandSpeedBonus * 100).toFixed(0)}%** faster`);
    }

    const duration = Math.floor(baseDuration * (1 - speedReduction) * (1 - islandSpeedBonus));

    await ActivityManager.startTrip({
        userID: user.id,
        channelId,
        duration,
        type: 'Archon' as const,
        tier,
        isSolo: true,
        contribution,
        quantity: 1,
        users: userList,
        bossUsers: [{
            user: user.id,
            userPercentChange: contribution,
            deathChance: 0,
            itemsToRemove: {},
            debugStr: `solo archon contribution:${contribution.toFixed(1)}%`
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

const tier1Uniques = ['Dragon bones'];
const tier2Uniques = ['Abyssal whip'];
const tier3Uniques = ['Twisted bow'];

export function getUniquesForTier(tier: 1 | 2 | 3): string[] {
    return { 1: tier1Uniques, 2: tier2Uniques, 3: tier3Uniques }[tier];
}

export function rollArchonLoot(tier: 1 | 2 | 3, multiplier = 1.0): Bank {
    const loot = new Bank();
    if (tier === 1) {
        loot.add('Coins', Math.floor(randInt(50_000, 200_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(50 / multiplier)))) loot.add('Dragon bones', randInt(1, 5));
    } else if (tier === 2) {
        loot.add('Coins', Math.floor(randInt(500_000, 2_000_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(30 / multiplier)))) loot.add('Dragon bones', randInt(5, 20));
    } else {
        loot.add('Coins', Math.floor(randInt(5_000_000, 20_000_000) * multiplier));
        if (roll(Math.max(1, Math.ceil(10 / multiplier)))) loot.add('Dragon bones', randInt(20, 100));
    }
    return loot;
}