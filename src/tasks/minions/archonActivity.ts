import { Bank } from 'oldschooljs';

import type { ArchonOptions } from '@/lib/bso/bsoTypes.js';
import {
    rollArchonLoot,
    getUniquesForTier,
    archonPresentations,
    tierGearPenalty
} from '@/mahoji/lib/abstracted_commands/archonCommand.js';
import {
    getMegabossLootBonus,
    defaultIslandUpgrades,
    type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

export const archonTask: MinionTask = {
    type: 'Archon',
    async run(data: ArchonOptions, { handleTripFinish, user }) {
        const { tier, users, isSolo, gearScore } = data;
        const presentation = archonPresentations[tier];
        const penalty = tierGearPenalty[tier];

        const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
        const lootBonus = getMegabossLootBonus(islandUpgrades);

        const gearMultiplier = penalty.floor + ((gearScore ?? 0) / 100) * (penalty.ceiling - penalty.floor);

        const effectiveRegularMultiplier = gearMultiplier * (1 + lootBonus);

        const lootResults = users.map(() => rollArchonLoot(tier, effectiveRegularMultiplier));

        const { regularLoot: realRegularLoot, uniqueLoot: realUniqueLoot } = lootResults[0];
        const realUserLoot = new Bank().add(realRegularLoot).add(realUniqueLoot);

        const uniquesForTier = getUniquesForTier(tier);
        const messages: string[] = [];

        if (isSolo) {
            await user.transactItems({ itemsToAdd: realUserLoot, collectionLog: true });

            for (let i = 1; i < lootResults.length; i++) {
                const { uniqueLoot: dummyUnique } = lootResults[i];
                for (const unique of uniquesForTier) {
                    if (dummyUnique.has(unique)) {
                        messages.push(`Another adventurer in your group received a unique: **${unique}**!`);
                        break;
                    }
                }
            }

            if (lootBonus > 0) {
                messages.push(`Archon Sanctum upgrade bonus: **+${(lootBonus * 100).toFixed(0)}%** to regular loot.`);
            }

            const effectiveGearPct = (gearMultiplier * 100).toFixed(1);
            messages.push(`Gear effectiveness: **${effectiveGearPct}%** (floor: ${(penalty.floor * 100).toFixed(0)}%)`);
        } else {
            for (let i = 0; i < users.length; i++) {
                const userId = users[i];
                const { regularLoot, uniqueLoot } = lootResults[i];
                const combinedLoot = new Bank().add(regularLoot).add(uniqueLoot);
                const recipient = await mUserFetch(userId);
                await recipient.transactItems({ itemsToAdd: combinedLoot, collectionLog: true });
            }
        }

        const numOthers = users.length - 1;

        const str = [
            presentation.flavourEnd,
            ``,
            `${user}, **${user.minionName}** and ${numOthers} adventurers defeated the **${presentation.name}**!`,
            `You received: ${realUserLoot}.`,
            ...(messages.length > 0 ? ['', ...messages] : [])
        ].join('\n');

        return handleTripFinish({
            user,
            channelId: data.channelId,
            message: str,
            data,
            loot: realUserLoot
        });
    }
};