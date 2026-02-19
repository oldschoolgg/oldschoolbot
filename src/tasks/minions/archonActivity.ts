import { Bank } from 'oldschooljs';

import type { ArchonOptions } from '@/lib/bso/bsoTypes.js';
import { rollArchonLoot, getUniquesForTier, archonPresentations } from '@/mahoji/lib/abstracted_commands/archonCommand.js';
import {
    getMegabossLootBonus,
    defaultIslandUpgrades,
    type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

export const archonTask: MinionTask = {
    type: 'Archon',
    async run(data: ArchonOptions, { handleTripFinish, user }) {
        const { tier, users, isSolo, contribution } = data;
        const presentation = archonPresentations[tier];

        // Island megaboss upgrade boosts loot
        const islandUpgrades = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;
        const lootBonus = getMegabossLootBonus(islandUpgrades);

        // Gear contribution: 50% loot floor at 0%, 100% at full contribution
        const contributionMultiplier = 0.5 + ((contribution ?? 100) / 100) * 0.5;
        const effectiveMultiplier = contributionMultiplier * (1 + lootBonus);

        // Roll loot for every user in the list, real or dummy
        const lootResults: Bank[] = users.map(() => rollArchonLoot(tier, effectiveMultiplier));
        const realUserLoot = lootResults[0];

        const uniquesForTier = getUniquesForTier(tier);
        const messages: string[] = [];

        if (isSolo) {
            await user.transactItems({ itemsToAdd: realUserLoot, collectionLog: true });

            // Check if any dummy got a unique — flavour messaging
            for (let i = 1; i < lootResults.length; i++) {
                const dummyLoot = lootResults[i];
                for (const unique of uniquesForTier) {
                    if (dummyLoot.has(unique)) {
                        messages.push(`✨ Another adventurer in your group received a unique: **${unique}**!`);
                        break;
                    }
                }
            }

            if (lootBonus > 0) {
                messages.push(`🏝️ Island Megaboss bonus applied: **+${(lootBonus * 100).toFixed(0)}%** loot.`);
            }
        } else {
            // Future world event path — give loot to every real user
            for (let i = 0; i < users.length; i++) {
                const userId = users[i];
                const loot = lootResults[i];
                const recipient = await mUserFetch(userId);
                await recipient.transactItems({ itemsToAdd: loot, collectionLog: true });
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