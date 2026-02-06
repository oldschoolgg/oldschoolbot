import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { skillEmoji } from '@/lib/data/emojis.js';
import { SailingActivityById } from '@/lib/skilling/skills/sailing/activities.js';
import { SailingDifficultyById } from '@/lib/skilling/skills/sailing/difficulties.js';
import { SailingRegionById } from '@/lib/skilling/skills/sailing/regions.js';
import {
	getOrCreateUserShip,
	getShipBonusesFromSnapshot,
	getShipCharts,
	getShipReputation,
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

		const difficulty = SailingDifficultyById.get(data.difficulty) ?? SailingDifficultyById.get('standard')!;
		const region = SailingRegionById.get(data.region) ?? SailingRegionById.get('starter_sea')!;
		const variant =
			activity.id === 'port_tasks' && data.variant
				? activity.variants?.find(v => v.id === data.variant)
				: undefined;

		const xpMultiplier = difficulty.xpMultiplier * region.xpMultiplier * (variant?.xpMultiplier ?? 1);
		const lootMultiplier = difficulty.lootMultiplier * region.lootMultiplier * (variant?.lootMultiplier ?? 1);
		const baseRiskOverride = activity.baseRisk + difficulty.riskBonus + region.riskBonus;

		const result = calcSailingTripResult({
			activity,
			quantity,
			ship,
			sailingLevel: data.sailingLevel ?? user.skillsAsLevels.sailing,
			xpMultiplier,
			lootMultiplier,
			baseRiskOverride
		});

		const baseFailedActions = result.failedActions;
		let hazardFailures = 0;
		const hazardEvents: string[] = [];
		if (activity.hazards && activity.hazards.length > 0) {
			for (let i = 0; i < quantity; i++) {
				for (const hazard of activity.hazards) {
					const adjustedChance = Math.min(0.5, Math.max(0, hazard.chance + difficulty.riskBonus / 2));
					if (rng.randFloat(0, 1) <= adjustedChance) {
						hazardFailures++;
						hazardEvents.push(hazard.name);
					}
				}
			}
		}

		if (hazardFailures > 0) {
			const totalFailed = Math.min(quantity, baseFailedActions + hazardFailures);
			result.failedActions = totalFailed;
			result.successfulActions = quantity - totalFailed;
			result.xpReceived = Math.floor(result.successfulActions * activity.xp * xpMultiplier);

			const { lootBonus } = getShipBonusesFromSnapshot(ship);
			const newLoot = new Bank();
			if (result.successfulActions > 0) {
				const lootRolls = Math.max(1, Math.floor(result.successfulActions * lootMultiplier));
				newLoot.add(activity.lootTable.roll(lootRolls));
			}

			const bonusRolls = Math.floor(result.successfulActions * lootBonus);
			if (bonusRolls > 0) {
				newLoot.add(activity.lootTable.roll(bonusRolls));
			}

			result.loot = newLoot;
			result.bonusRolls = bonusRolls;
		}

		const xpRes = await user.addXP({
			skillName: 'sailing',
			amount: result.xpReceived,
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

		if (hazardFailures > 0) {
			str += `\nHazards encountered: ${hazardEvents.slice(0, 3).join(', ')}${hazardEvents.length > 3 ? '...' : ''}.`;
			str += `\nHazard failures: ${hazardFailures}.`;
		}

		if (baseFailedActions > 0) {
			str += `\nBase failures: ${baseFailedActions}.`;
		}

		if (result.failedActions > 0 && baseFailedActions === 0 && hazardFailures === 0) {
			str += `\n${result.failedActions} actions failed.`;
		}

		if (variant?.lootTable) {
			const bonusLootRolls = Math.max(1, Math.floor(result.successfulActions * lootMultiplier * 0.25));
			result.loot.add(variant.lootTable.roll(bonusLootRolls));
		}

		const successRate = Math.round(result.successChance * 10000) / 100;
		str += `\nSuccess rate: ${successRate}%.`;

		if (result.bonusRolls > 0) {
			str += `\nCargo bonus rolls: ${result.bonusRolls}.`;
		}

		const shipState = await getOrCreateUserShip(user.id);
		const currentRep = getShipReputation(shipState);
		const currentCharts = getShipCharts(shipState);
		const repGained = Math.floor((activity.reputation * result.successfulActions) / 10);
		const chartsGained = activity.id === 'sea_charting' ? Math.max(1, Math.floor(result.successfulActions / 5)) : 0;

		if (repGained > 0 || chartsGained > 0) {
			await updateUpgradesBank(user.id, {
				reputation: currentRep + repGained,
				charts: currentCharts + chartsGained
			});
			str += `\nReputation gained: ${repGained}. Charts gained: ${chartsGained}.`;
		}

		if (result.loot.length > 0) {
			await user.transactItems({
				itemsToAdd: result.loot,
				collectionLog: true
			});
			str += `\nYou received: ${result.loot}.`;
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
