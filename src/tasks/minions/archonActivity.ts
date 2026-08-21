import type { ArchonEventOptions, ArchonOptions } from '@/lib/bso/bsoTypes.js';
import { getMegabossLootBonus, getMegabossUniqueBonus } from '@/lib/bso/commands/islandUpgrades.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';

import { roll } from 'node-rng';
import { Bank } from 'oldschooljs';

import { readState } from '@/mahoji/commands/islandupgrade.js';
import {
	archonPresentations,
	getUniquesForTier,
	rollArchonLoot,
	tierGearPenalty
} from '@/mahoji/lib/abstracted_commands/archonCommand.js';

export const archonTask: MinionTask = {
	type: 'Archon',
	async run(data: ArchonOptions, { handleTripFinish, user }) {
		const { tier, users, isSolo, gearScore } = data;
		const presentation = archonPresentations[tier];
		const penalty = tierGearPenalty[tier];

		const { upgrades, maintenance, assignment } = readState(user);
		const lootBonus = getMegabossLootBonus(upgrades, maintenance, assignment);
		const uniqueBonus = getMegabossUniqueBonus(upgrades, maintenance, assignment);

		const gearMultiplier = penalty.floor + ((gearScore ?? 0) / 100) * (penalty.ceiling - penalty.floor);

		const effectiveRegularMultiplier = gearMultiplier * (1 + lootBonus);

		const lootResults = users.map(() => rollArchonLoot(tier, effectiveRegularMultiplier, uniqueBonus));

		const { regularLoot: realRegularLoot, uniqueLoot: realUniqueLoot } = lootResults[0];
		const realUserLoot = new Bank().add(realRegularLoot).add(realUniqueLoot);

		const uniquesForTier = getUniquesForTier(tier);
		const messages: string[] = [];

		if (user.usingPet('Archibald')) {
			realUserLoot.multiply(2);
			messages.push('Archibald doubled your Archon loot!');
		}

		const baseArchibaldRate = tier === 1 ? 7000 : tier === 2 ? 5000 : 3000;
		const archibaldRate = Math.max(1, Math.floor(baseArchibaldRate / (1 + uniqueBonus)));
		if (roll(archibaldRate)) {
			realUserLoot.add('Archibald');
			messages.push("You have a funny feeling you're now responsible for something.");
		}

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
				messages.push(`Archon Sanctum bonus: **+${(lootBonus * 100).toFixed(0)}%** regular loot.`);
			}
			if (uniqueBonus > 0) {
				messages.push(`Archon Sanctum bonus: **+${(uniqueBonus * 100).toFixed(0)}%** unique chance.`);
			}

			const effectiveGearPct = (gearMultiplier * 100).toFixed(1);
			messages.push(
				`Gear effectiveness: **${effectiveGearPct}%** (floor: ${(penalty.floor * 100).toFixed(0)}%, scales regular loot)`
			);

			const totalLootMultiplierPct = (effectiveRegularMultiplier * 100).toFixed(1);
			messages.push(`Net regular loot: **${totalLootMultiplierPct}%** of base rolls.`);
		} else {
			for (let i = 0; i < users.length; i++) {
				const userId = users[i];
				const { regularLoot, uniqueLoot } = lootResults[i];
				const combinedLoot = new Bank().add(regularLoot).add(uniqueLoot);
				const recipient = await mUserFetch(userId);
				await recipient.transactItems({ itemsToAdd: combinedLoot, collectionLog: true });
			}
		}

		const monsterId = {
			1: EBSOMonster.ARCHON_TIER_1,
			2: EBSOMonster.ARCHON_TIER_2,
			3: EBSOMonster.ARCHON_TIER_3
		}[tier];

		await user.incrementKC(monsterId, 1);

		const newKC = await user.getKC(monsterId);
		messages.push(`Your ${presentation.name} kill count is now **${newKC}**.`);

		const numOthers = users.length - 1;

		const lootStr = realUserLoot.length > 0 ? `You received: ${realUserLoot}.` : `You received no loot this time.`;

		const str = [
			presentation.flavourEnd,
			``,
			`${user}, **${user.minionName}** and ${numOthers} adventurers defeated the **${presentation.name}**!`,
			lootStr,
			...(messages.length > 0 ? ['', ...messages] : [])
		].join('\n');

		if (!str || str.trim().length === 0) {
			console.error('Archon task produced empty message string', { tier, users, realUserLoot });
			return handleTripFinish({
				user,
				channelId: data.channelId,
				message: `${user.minionName} defeated the **${presentation.name}**, but something went wrong generating the result message.`,
				data,
				loot: realUserLoot
			});
		}

		return handleTripFinish({
			user,
			channelId: data.channelId,
			message: str,
			data,
			loot: realUserLoot
		});
	}
};

export const archonEventTask: MinionTask = {
	type: 'ArchonEvent',
	async run(data: ArchonEventOptions, { handleTripFinish, user }) {
		return handleTripFinish({
			user,
			channelId: data.channelId,
			message: `${user.minionName} participated in the Archon Event!`,
			data,
			loot: null
		});
	}
};
