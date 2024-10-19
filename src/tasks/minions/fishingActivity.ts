import { objectEntries, randInt, sumArr } from 'e';
import { EItem } from 'oldschooljs';
import { z } from 'zod';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing, { determineAnglerBoost } from '../../lib/skilling/skills/fishing';
import { type Fish, type FishInSpot, SkillsEnum } from '../../lib/skilling/types';
import type { GearBank } from '../../lib/structures/GearBank';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
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
	spiritFlakesToRemove,
	fishingSpotResults
}: {
	gearBank: GearBank;
	fishingSpotResults: FishingSpotResults;
	spot: Fish;
	spiritFlakesToRemove: number | undefined;
}) {
	const updateBank = new UpdateBank();
	const fishingLevel = gearBank.skillsAsLevels.fishing;
	const minnowRange = determineMinnowRange(fishingLevel);
	let totalXP = 0;

	for (const { fish, quantity, loot } of fishingSpotResults) {
		totalXP += quantity * fish.xp;
		console.log(totalXP);
		updateBank.itemLootBank.add(fish.id, loot);

		if ('otherXP' in fish && fish.otherXP) {
			for (const [skillName, xp] of objectEntries(fish.otherXP)) {
				updateBank.xpBank.add(skillName, quantity * xp!);
			}
		}

		if (fish.tertiary) {
			for (let i = 0; i < quantity; i++) {
				if (!roll(fish.tertiary.chance)) continue;
				updateBank.itemLootBank.add(fish.tertiary.id);
			}
		}
	}
	updateBank.xpBank.add('fishing', totalXP);

	const anglerBoost = determineAnglerBoost({ gearBank });
	if (anglerBoost > 0) {
		updateBank.xpBank.add('fishing', (updateBank.xpBank.amount('fishing') * anglerBoost) / 100);
	}

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
		totalCatches
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
					xp: subfish.xp
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
		const { fishID, userID, channelID, Qty, loot = [], flakesToRemove } = data;

		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);
		const fish = Fishing.Fishes.find(fish => fish.name === fishID)!;
		console.log('test');
		const { updateBank, totalCatches } = determineFishingResult({
			gearBank: user.gearBank,
			spot: fish,
			spiritFlakesToRemove: flakesToRemove,
			fishingSpotResults: temporaryFishingDataConvert(fish, Qty, loot)
		});

		const updateResult = await updateBank.transact(user);
		if (typeof updateResult === 'string') {
			// This shouldn't really error.. although if the user drops required bait during the trip, it will error.
			throw new Error(updateResult);
		}

		let str = `${user}, ${user.minionName} finished fishing ${totalCatches} ${fish.name}. You received ${updateBank.xpBank}.`;
		console.log(Qty);
		if (loot[0]) {
			str += `\nYou received ${updateResult.itemTransactionResult?.itemsAdded}.`;
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
