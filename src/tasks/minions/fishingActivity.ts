import { BSOItem } from '@/lib/bso/BSOItem.js';
import { convertMysteriousBottleToSeaWater, getEclipsePetName } from '@/lib/bso/summerDays.js';

import { Emoji, Events, Time } from '@oldschoolgg/toolkit';
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
			powerfish = false,
			sharkLureQuantity = 0,
			extraCatchRolls
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
		const extraCatchRollsArray = normalizeNumericArray(extraCatchRolls, subfishCount);

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
			isPowerfishing: powerfish,
			sharkLureQuantity,
			extraCatchRolls: extraCatchRollsArray,
			collectionLog: user.cl
		});

		if (fish.moonKeyHalfCatchRate) {
			const perCatchRate = fish.moonKeyHalfCatchRate;
			rollForMoonKeyHalf({
				rng,
				user: user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun),
				duration: data.duration,
				loot: result.updateBank.itemLootBank,
				quantity: result.totalCatchRolls,
				perCatchRate
			});
		}

		let bottleRate = 500;
		if (fish.name === 'Rocktail') bottleRate = 350;
		if (fish.name === 'Manta ray') bottleRate = 250;
		if (fish.name === 'Lobster') bottleRate = 150;
		if (fish.name === 'Mackerel') bottleRate = 100;
		if (fish.alias?.includes('herring')) bottleRate = 100;
		const hasPatriciaEquipped = user.usingPet('Patricia');
		const eclipsePetName = hasPatriciaEquipped ? getEclipsePetName(user) : 'Patricia';
		if (hasPatriciaEquipped) bottleRate = Math.floor(bottleRate * 0.5);
		if (user.usingPet('Partycrab')) bottleRate = Math.floor(bottleRate * 0.7);

		let crabCageRate = hasPatriciaEquipped ? 100 : 250;
		if (fish.name === 'Lobster') crabCageRate = Math.floor(crabCageRate * 0.5);
		const minutes = Math.floor(data.duration / Time.Minute);
		const userAlreadyHasCrabCage = user.allItemsOwned.has(BSOItem.OLD_CRAB_CAGE);
		if (fish.name === 'Lobster') crabCageRate = Math.floor(crabCageRate * 0.5);

		let bottlesFound = 0;
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(bottleRate)) {
				bottlesFound++;
			}
		}
		if (bottlesFound) {
			result.updateBank.itemLootBank.add(BSOItem.MYSTERIOUS_BOTTLE, bottlesFound);
			if (bottlesFound === 1) {
				result.messages.push('🏝🍹You gently tug something from the shallows: a *Mysterious bottle!**.');
			} else {
				result.messages.push(
					`🏝️🍹You got quite the haul! You drug ${bottlesFound}x *Mysterious bottles!** out of the ocean!.`
				);
			}
		}

		if (!userAlreadyHasCrabCage) {
			for (let i = 0; i < minutes; i++) {
				if (rng.roll(crabCageRate)) {
					result.updateBank.itemLootBank.add(BSOItem.OLD_CRAB_CAGE);
					result.messages.push(
						hasPatriciaEquipped
							? `🦀 ${eclipsePetName} tugged something rusted from the shallows: an **Old crab cage**.`
							: '🦀 A strange force helped you draw something rusted from the briny deep: an **Old crab cage**.'
					);
					break;
				}
			}
		}
		if (hasPatriciaEquipped) {
			if (fish.name === 'Lobster' && user.hasEquipped(BSOItem.OLD_CRAB_CAGE) && !user.cl.has(BSOItem.PARTYCRAB)) {
				for (let i = 0; i < minutes; i++) {
					if (rng.roll(24 * 60)) {
						result.updateBank.itemLootBank.add(BSOItem.PARTYCRAB);
						result.messages.push(
							'<:partycrab:1507689107806097541> The old crab cage rattled, and a Partycrab climbed out like it had been waiting years for this moment.'
						);
						break;
					}
				}
			}
		}

		if (user.hasEquipped(BSOItem.MYSTERIOUS_BOTTLE)) {
			const mysteriousBottleChance = hasPatriciaEquipped
				? 500
				: user.usingPet('Partycrab')
					? 650
					: user.usingPet('Shelldon')
						? 750
						: 1000;

			for (let i = 0; i < minutes; i++) {
				if (!rng.roll(mysteriousBottleChance)) continue;
				if (await convertMysteriousBottleToSeaWater(user)) {
					result.messages.push(
						'🫙 A cold violet current swirled into your Mysterious bottle while fishing. It is now a **Bottle of sea water**'
					);
				}
				break;
			}
		}

		const updateResult = await result.updateBank.transact(user);
		if (typeof updateResult === 'string') {
			throw new Error(`Fishing trip update bank failed: ${updateResult}`);
		}

		const { itemTransactionResult, message: xpMessage } = updateResult;

		let message = `${user}, ${user.minionName} finished fishing ${result.totalCatches} ${fish.name}. `;
		if (powerfish) {
			message += '\n**Since you were powerfishing, you dropped all of those fish on the ground!**\n';
		}

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
