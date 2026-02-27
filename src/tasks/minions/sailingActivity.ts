import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { skillEmoji } from '@/lib/data/emojis.js';
import { SailingActivityById } from '@/lib/skilling/skills/sailing/activities.js';
import { rollOceanEncounters } from '@/lib/skilling/skills/sailing/encounters.js';
import {
	getClamItemId,
	getOrCreateUserShip,
	getShipBonusesFromSnapshot,
	hasFacility,
	updateUpgradesBank
} from '@/lib/skilling/skills/sailing/ship.js';
import { calcSailingTripResult } from '@/lib/skilling/skills/sailing/util.js';
import type { SailingActivityTaskOptions } from '@/lib/types/minions.js';

export const sailingTask: MinionTask = {
	type: 'Sailing',
	async run(data: SailingActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { activity: activityId, quantity, channelId, duration, ship } = data;
		const activity = SailingActivityById.get(activityId);
		if (!activity) {
			throw new Error(`Unknown sailing activity: ${activityId}`);
		}

		const variant = data.variant ? activity.variants?.find(v => v.id === data.variant) : undefined;

		const xpMultiplier = variant?.xpMultiplier ?? 1;
		const lootMultiplier = variant?.lootMultiplier ?? 1;

		const result = calcSailingTripResult({
			activity,
			quantity,
			ship,
			sailingLevel: data.sailingLevel ?? user.skillsAsLevels.sailing,
			xpMultiplier,
			lootMultiplier
		});

		const shipState = await getOrCreateUserShip(user.id);
		const extractorTicks = hasFacility(shipState, 'crystal_extractor') ? Math.floor(duration / 63_000) : 0;
		const extractorXP = extractorTicks * 250;

		const { lootBonus } = getShipBonusesFromSnapshot(ship);
		if (result.successfulActions > 0) {
			const bonusRolls = Math.floor(result.successfulActions * lootBonus);
			if (bonusRolls > 0) {
				result.loot.add(activity.lootTable.roll(bonusRolls));
				result.bonusRolls = bonusRolls;
			}
		}

		const encounterResult = rollOceanEncounters({
			duration,
			sailingLevel: user.skillsAsLevels.sailing,
			clamItemId: getClamItemId(shipState),
			user,
			rng
		});
		if (encounterResult.loot.length > 0) {
			result.loot.add(encounterResult.loot);
		}

		const xpRes = await user.addXP({
			skillName: 'sailing',
			amount: result.xpReceived + extractorXP + encounterResult.xp,
			duration
		});

		if (activity.petChance && result.successfulActions > 0) {
			const rollRate = Math.ceil(activity.petChance / result.successfulActions);
			if (rng.roll(rollRate)) {
				result.loot.add('Sea snake');
				globalClient.emit(
					Events.ServerNotification,
					`${skillEmoji.sailing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Sea snake while ${activity.name}!`
				);
			}
		}

		let str = `${user}, ${user.minionName} finished ${activity.name} for ${quantity} actions. ${xpRes}`;

		if (variant?.lootTable) {
			const bonusLootRolls = Math.max(1, Math.floor(result.successfulActions * lootMultiplier * 0.25));
			result.loot.add(variant.lootTable.roll(bonusLootRolls));
		}

		const avgActionMs = Math.floor(duration / Math.max(1, quantity));
		const heartBank = new Bank().add('Heart of Ithell', 1);
		const shouldAwardHeart = activity.id === 'gwenith_glide' && variant?.id === 'shark' && avgActionMs <= 222_000;
		if (shouldAwardHeart && !user.owns(heartBank)) {
			result.loot.add(heartBank);
			str += `\nYou earned a Heart of Ithell for a Gwenith Glide (Shark) clear in ${Math.floor(
				avgActionMs / 60000
			)}:${String(Math.floor((avgActionMs % 60000) / 1000)).padStart(2, '0')}.`;
		}

		const successRate = Math.round(result.successChance * 10000) / 100;
		str += `\nSuccess rate: ${successRate}%.`;

		if (result.bonusRolls > 0) {
			str += `\nCargo bonus rolls: ${result.bonusRolls}.`;
		}

		if (encounterResult.encounters > 0) {
			str += `\nOcean encounters: ${encounterResult.encounters} for ${encounterResult.xp} Sailing XP.`;
			if (encounterResult.messages.length > 0) {
				str += `\n${encounterResult.messages.join(' ')}`;
			}
		}
		if (encounterResult.clamConsumed) {
			await updateUpgradesBank(user.id, { clamItemId: null });
		}

		if (result.loot.length > 0) {
			await user.transactItems({
				itemsToAdd: result.loot,
				collectionLog: true
			});
			str += `\nYou received: ${result.loot}.`;
		}

		if (extractorXP > 0) {
			str += `\nCrystal extractor XP: ${extractorXP}.`;
		}

		return handleTripFinish({
			user,
			channelId,
			message: str,
			data,
			loot: result.loot.length > 0 ? result.loot : null
		});
	}
};
