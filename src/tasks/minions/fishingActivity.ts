import { Time, randInt, sumArr } from 'e';
import { EItem } from 'oldschooljs';
import { z } from 'zod';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing, { determineAnglerBoost } from '../../lib/skilling/skills/fishing';
import { type Fish, type FishInSpot, SkillsEnum } from '../../lib/skilling/types';
import type { GearBank } from '../../lib/structures/GearBank';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

function determineMinnowRange(fishingLevel: number) {
	const minnowQuantity: { [key: number]: number[] } = {
		99: [10, 14],
		95: [11, 13],
		90: [10, 13],
		85: [10, 11],
		1: [10, 10]
	};
	let baseMinnow = [10, 10];
	for (const [level, quantities] of Object.entries(minnowQuantity).reverse()) {
		if (fishingLevel >= Number.parseInt(level)) {
			baseMinnow = quantities;
			break;
		}
	}
	return baseMinnow;
}

const allFishIDs = Fishing.Fishes.flatMap(fish => fish.name);

type FishingSpotResult = { fish: FishInSpot; quantity: number; loot: number };
type FishingSpotResults = FishingSpotResult[];

export function determineFishingResult({
	spot,
	gearBank,
	duration,
	spiritFlakesToRemove,
	fishingSpotResults
}: {
	gearBank: GearBank;
	duration: number;
	fishingSpotResults: FishingSpotResults;
	spot: Fish;
	spiritFlakesToRemove: number | undefined;
}) {
	const updateBank = new UpdateBank();
	const fishingLevel = gearBank.skillsAsLevels.fishing;
	const minnowRange = determineMinnowRange(fishingLevel);
	const messages: string[] = [];
	let xpToReceive = 0;
	let otherXpToReceive = 0;

	for (const { fish, quantity, loot } of fishingSpotResults) {
		xpToReceive += quantity * fish.xp;
		updateBank.itemLootBank.add(fish.id, loot);

		if ('otherXP' in fish) {
			otherXpToReceive += quantity * fish.otherXP!;
		}

		if (fish.tertiary) {
			for (let i = 0; i < quantity; i++) {
				if (!roll(fish.tertiary.chance)) continue;
				updateBank.itemLootBank.add(fish.tertiary.id);
			}
		}
	}

	const anglerBoost = determineAnglerBoost({ gearBank });
	if (anglerBoost > 0) {
		const bonusXP = (xpToReceive * anglerBoost) / 100;
		messages.push(`**Bonus XP:** ${bonusXP.toFixed(1)} (+${anglerBoost.toFixed(1)}%) XP for angler`);
		xpToReceive += bonusXP;
	}

	updateBank.xpBank.add('fishing', xpToReceive);
	if (otherXpToReceive > 0) {
		updateBank.xpBank.add('strength', otherXpToReceive);
		updateBank.xpBank.add('agility', otherXpToReceive);
	}
	const xpHr = toKMB((xpToReceive / (duration / Time.Minute)) * 60).toLocaleString();
	const otherXpHr = toKMB((otherXpToReceive / (duration / Time.Minute)) * 60).toLocaleString();

	if (spot.name === 'Minnow') {
		const minnowQty = updateBank.itemLootBank.amount(EItem.MINNOW);
		let newMinnowQty = 0;
		for (let i = 0; i < minnowQty; i++) {
			newMinnowQty += randInt(minnowRange[0], minnowRange[1]);
		}
		updateBank.itemLootBank.set(EItem.MINNOW, newMinnowQty);
	} else if (spot.name === 'Karambwanji') {
		const baseKarambwanji = 1 + Math.floor(fishingLevel / 5);
		updateBank.itemLootBank.add(
			EItem.RAW_KARAMBWANJI,
			updateBank.itemLootBank.amount(EItem.RAW_KARAMBWANJI) * baseKarambwanji
		);
	}

	if (spiritFlakesToRemove) {
		updateBank.itemCostBank.add('Spirit flakes', spiritFlakesToRemove);
	}

	const totalCatches = sumArr(fishingSpotResults.map(f => f.quantity));

	if (spot.bait) {
		updateBank.itemCostBank.add(spot.bait, totalCatches);
	}

	if (spot.clueScrollChance) {
		addSkillingClueToLoot(
			gearBank,
			SkillsEnum.Fishing,
			totalCatches,
			spot.clueScrollChance,
			updateBank.itemLootBank
		);
	}

	if (spot.petChance) {
		const { petDropRate } = skillingPetDropRate(gearBank, SkillsEnum.Fishing, spot.petChance);
		for (let i = 0; i < totalCatches; i++) {
			if (!roll(petDropRate)) continue;
			updateBank.itemLootBank.add('Heron');
		}
	}

	return {
		updateBank,
		totalCatches,
		messages,
		xpHr,
		otherXpHr
	};
}

export function temporaryFishingDataConvert(fish: Fish, Qty: number[], loot: number[]): FishingSpotResults {
	const fishingSpotResults: FishingSpotResults = [];

	for (let i = 0; i < Qty.length; i++) {
		if (Qty[i] > 0) {
			const subfish = fish.subfishes![i];
			fishingSpotResults.push({
				fish: {
					id: subfish.id,
					level: subfish.level,
					intercept: subfish.intercept!,
					slope: subfish.slope!,
					xp: subfish.xp,
					otherXP: subfish.otherXP ?? 0
				},
				quantity: Qty[i],
				loot: loot[i]
			});
		}
	}

	return fishingSpotResults;
}

export const fishingTask: MinionTask = {
	type: 'Fishing',
	dataSchema: z.object({
		type: z.literal('Fishing'),
		fishID: z.string().refine(fishID => allFishIDs.includes(fishID), {
			message: 'Invalid fish ID'
		}),
		quantity: z.number().min(1)
	}),
	async run(data: FishingActivityTaskOptions) {
		const { fishID, userID, channelID, Qty, loot = [], flakesToRemove, duration } = data;

		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);
		const fish = Fishing.Fishes.find(fish => fish.name === fishID)!;

		const { updateBank, totalCatches, messages, xpHr, otherXpHr } = determineFishingResult({
			gearBank: user.gearBank,
			duration: duration,
			spot: fish,
			spiritFlakesToRemove: flakesToRemove,
			fishingSpotResults: temporaryFishingDataConvert(fish, Qty, loot)
		});

		const updateResult = await updateBank.transact(user);
		if (typeof updateResult === 'string') {
			// This shouldn't really error.. although if the user drops required bait during the trip, it will error.
			throw new Error(updateResult);
		}

		let str = `${user}, ${user.minionName} finished fishing ${totalCatches} ${fish.name}. `;

		if (otherXpHr !== '0') {
			str += `You received ${updateBank.xpBank} (${xpHr}/Hr and ${otherXpHr}/Hr)`;
		} else {
			str += `You received ${updateBank.xpBank} (${xpHr}/Hr)`;
		}

		if (loot[0]) {
			str += `\nYou received ${updateResult.itemTransactionResult?.itemsAdded}.`;
		}

		if (messages.length > 0) {
			str += `\n${messages.join(', ')}.`;
		}

		if (updateBank.itemLootBank.has(EItem.HERON)) {
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${fishLvl} Fishing!`
			);
		}

		handleTripFinish(user, channelID, str, undefined, data, updateBank.itemLootBank);
	}
};
