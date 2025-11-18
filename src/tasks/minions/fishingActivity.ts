import { Emoji, Events } from '@oldschoolgg/toolkit';
import { EItem } from 'oldschooljs';

import { QuestID } from '@/lib/minions/data/quests.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import { FISHING_REWORK_MESSAGE, findFishingSpotForStoredTrip } from '@/lib/skilling/skills/fishing/fishingRework.js';
import type { FishingActivityTaskOptions } from '@/lib/types/minions.js';
import { rollForMoonKeyHalf } from '@/lib/util/minionUtils.js';

export const fishingTask: MinionTask = {
	type: 'Fishing',
	async run(data: FishingActivityTaskOptions, { handleTripFinish, user, rng }) {
		const {
			channelId,
			qty,
			loot,
			blessingExtra: storedBlessingExtra,
			flakeExtra: storedFlakeExtra,
			blessingQuantity,
			flakesQuantity,
			usedBarbarianCutEat = false,
			powerfish = false
		} = data;

		const coerceNumber = (value: unknown): number | undefined => {
			if (value === null || value === undefined) {
				return undefined;
			}
			const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
			return Number.isFinite(num) ? num : undefined;
		};

		const blessingExtra = coerceNumber(storedBlessingExtra) ?? coerceNumber(blessingQuantity) ?? 0;
		const flakeExtra = coerceNumber(storedFlakeExtra) ?? coerceNumber(flakesQuantity) ?? 0;

		const fish = findFishingSpotForStoredTrip(data.fishID);
		if (!fish || !fish.subfishes) {
			return handleTripFinish(user, channelId, FISHING_REWORK_MESSAGE, data);
		}

		if (!Array.isArray(qty) || qty.length !== fish.subfishes.length) {
			return handleTripFinish(user, channelId, FISHING_REWORK_MESSAGE, data);
		}

		if (loot !== undefined && (!Array.isArray(loot) || loot.length !== fish.subfishes.length)) {
			return handleTripFinish(user, channelId, FISHING_REWORK_MESSAGE, data);
		}

		const subfishCount = fish.subfishes.length;
		const normalizeNumericArray = (input: number[] | undefined, length: number) => {
			const normalized: number[] = new Array(length).fill(0);
			if (!input) {
				return normalized;
			}

			for (let i = 0; i < length; i++) {
				const value = input[i];
				normalized[i] = typeof value === 'number' ? value : Number(value ?? 0);
				if (!Number.isFinite(normalized[i])) {
					normalized[i] = 0;
				}
			}
			return normalized;
		};

		const catches = normalizeNumericArray(qty, subfishCount);
		const lootArray = normalizeNumericArray(loot, subfishCount);

		for (let i = catches.length; i < subfishCount; i++) {
			catches[i] = 0;
		}
		for (let i = lootArray.length; i < subfishCount; i++) {
			lootArray[i] = 0;
		}

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: data.duration,
			catches,
			loot: lootArray,
			gearBank: user.gearBank,
			blessingExtra,
			flakeExtra,
			rng,
			usedBarbarianCutEat,
			isPowerfishing: powerfish
		});

		if (fish.moonKeyHalfEligible !== false) {
			const perCatchRate = fish.moonKeyHalfCatchRate;
			rollForMoonKeyHalf({
				rng,
				user: user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun),
				duration: data.duration,
				loot: result.updateBank.itemLootBank,
				quantity: perCatchRate ? result.totalCatches : undefined,
				perCatchRate
			});
		}

		const updateResult = await result.updateBank.transact(user);
		if (typeof updateResult === 'string') {
			throw new Error(`Fishing trip update bank failed: ${updateResult}`);
		}

		const { itemTransactionResult, message: xpMessage } = updateResult;

		let message = `${user}, ${user.minionName} finished fishing ${result.totalCatches} ${fish.name}. `;

		const bonusXpEntries = Object.entries(result.bonusXpPerHour ?? {}).filter(([, value]) => value);
		const perHourSegments = [`${result.xpPerHour}/Hr`];
		if (bonusXpEntries.length > 0) {
			for (const [skill, value] of bonusXpEntries) {
				const formattedSkill = `${skill.charAt(0).toUpperCase()}${skill.slice(1)}`;
				perHourSegments.push(`${value}/Hr ${formattedSkill}`);
			}
		}
		message += `You received ${result.updateBank.xpBank} (${perHourSegments.join(', ')}).`;

		if (xpMessage) {
			const congratsLines = xpMessage
				.split('\n')
				.map(line => line.trim())
				.filter(line => line.startsWith('**Congratulations'));
			if (congratsLines.length > 0) {
				message += `\n${congratsLines.join('\n')}`;
			}
		}

		if (itemTransactionResult?.itemsAdded.length) {
			message += `\nYou received ${itemTransactionResult.itemsAdded}.`;
		}

		if (result.messages.length > 0) {
			message += `\n${result.messages.join(', ')}.`;
		}

		if (itemTransactionResult?.itemsAdded.has(EItem.HERON)) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${user.skillsAsLevels.fishing} Fishing!`
			);
		}

		return handleTripFinish(user, channelId, message, data, result.updateBank.itemLootBank);
	}
};
