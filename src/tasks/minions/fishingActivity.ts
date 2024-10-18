import { objectEntries, randInt, sumArr } from 'e';
import { EItem } from 'oldschooljs';
import { z } from 'zod';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing, { determineAnglerBoost } from '../../lib/skilling/skills/fishing';
import { type Fish, SkillsEnum } from '../../lib/skilling/types';
import type { GearBank } from '../../lib/structures/GearBank';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { Skills } from '../../lib/types';
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

const allFishIDs = Fishing.Fishes.flatMap(fish => [fish.id, fish.id2, fish.id3]);
interface FishInSpot {
	id: number;
	intercept: number;
	slope: number;
	xp: number;
	otherXP?: Omit<Skills, 'fishing'>;
	/**
	 * Items that have a tertiary chance to drop from catching one of these fish, i.e "Big swordfish" from swordfish.
	 *
	 * 1 in X chance, to receive item with the id
	 */
	tertiary?: { chance: number; id: number };
}

type FishingSpotResult = { fish: FishInSpot; quantity: number, loot: number };
type FishingSpotResults = FishingSpotResult[];

export function determineFishingResult({
	spot,
	gearBank,
	spiritFlakesToRemove,
	fishingSpotResults,
	duration
}: {
	gearBank: GearBank;
	fishingSpotResults: FishingSpotResults;
	spot: Fish;
	spiritFlakesToRemove: number | undefined;
	duration: number;
}) {
	const updateBank = new UpdateBank();
	const fishingLevel = gearBank.skillsAsLevels.fishing;
	const minnowRange = determineMinnowRange(fishingLevel);
	let totalXP = 0;

	for (const { fish, quantity, loot } of fishingSpotResults) {

		totalXP += quantity * fish.xp;
		console.log(totalXP)
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
	updateBank.xpBank.add('fishing', totalXP, { duration });


	const anglerBoost = determineAnglerBoost({ gearBank });
	if (anglerBoost > 0) {
		updateBank.xpBank.add('fishing', updateBank.xpBank.amount('fishing') * anglerBoost / 100);
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

export function temporaryFishingDataConvert(fish: Fish, Qty1: number, Qty2: number, Qty3: number,
	loot1: number, loot2: number, loot3: number): FishingSpotResults {
	const fishingSpotResults: FishingSpotResults = [];
	if (Qty1 > 0) {
		fishingSpotResults.push({
			fish: { id: fish.id, intercept: fish.intercept1!, slope: fish.slope1!, xp: fish.xp },
			quantity: Qty1,
			loot: loot1
		});
	}
	if (Qty2 > 0) {
		fishingSpotResults.push({
			fish: { id: fish.id2!, intercept: fish.intercept2!, slope: fish.slope2!, xp: fish.xp2! },
			quantity: Qty2,
			loot: loot2
		});
	}
	if (Qty3 > 0) {
		fishingSpotResults.push({
			fish: { id: fish.id3!, intercept: fish.intercept3!, slope: fish.slope3!, xp: fish.xp3! },
			quantity: Qty3,
			loot: loot3
		});
	}
	return fishingSpotResults;
}

export const fishingTask: MinionTask = {
	type: 'Fishing',
	dataSchema: z.object({
		type: z.literal('Fishing'),
		fishID: z.number().refine(fishID => allFishIDs.includes(fishID), {
			message: 'Invalid fish ID'
		}),
		quantity: z.number().min(1)
	}),
	async run(data: FishingActivityTaskOptions) {
		let {
			fishID,
			userID,
			channelID,
			duration,
			spirit_flakes,
			Qty1,
			Qty2 = 0,
			Qty3 = 0,
			loot1 = 0,
			loot2 = 0,
			loot3 = 0,
			flakesToRemove
		} = data;

		spirit_flakes = spirit_flakes ?? false;

		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);
		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

		const { updateBank, totalCatches } = determineFishingResult({
			gearBank: user.gearBank,
			spot: fish,
			spiritFlakesToRemove: flakesToRemove,
			fishingSpotResults: temporaryFishingDataConvert(fish, Qty1, Qty2, Qty3, loot1, loot2, loot3),
			duration: duration
		});

		const updateResult = await updateBank.transact(user);
		if (typeof updateResult === 'string') {
			// This shouldn't really error.. although if the user drops required bait during the trip, it will error.
			throw new Error(updateResult);
		}

		//let str = `${user}, ${user.minionName} finished fishing ${totalCatches} ${fish.name}. ${updateResult.message}`;
		let str = `${user}, ${user.minionName} finished fishing ${totalCatches} ${fish.name}. You received ${updateBank.xpBank}.`;

		if (loot1) {
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
