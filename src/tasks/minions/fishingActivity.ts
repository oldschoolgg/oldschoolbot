//import { calcPercentOfNum, percentChance, randInt } from 'e';
import { calcPercentOfNum } from 'e';
import { Bank } from 'oldschooljs';
import { z } from 'zod';
//import { Time } from 'e';
import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
// itemID from '../../lib/util/itemID';
import { anglerBoostPercent } from '../../mahoji/mahojiSettings';

const allFishIDs = Fishing.Fishes.flatMap(fish => [fish.id, fish.id2, fish.id3]);

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
		let { fishID, userID, channelID, duration, spirit_flakes,
			Qty1, Qty2 = 0, Qty3 = 0, loot1 = 0, loot2 = 0, loot3 = 0, flakesToRemove } = data;

		spirit_flakes = spirit_flakes ?? false;

		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);

		const minnowQuantity: { [key: number]: number[] } = {
			99: [10, 14],
			95: [11, 13],
			90: [10, 13],
			85: [10, 11],
			1: [10, 10]
		};

		let baseMinnow = [10, 10];
		for (const [level, quantities] of Object.entries(minnowQuantity).reverse()) {
			if (fishLvl >= Number.parseInt(level)) {
				baseMinnow = quantities;
				break;
			}
		}

		const baseKarambwanji = 1 + Math.floor(fishLvl / 5);

		let xpReceived = 0;
		let agilityXpReceived = 0;
		let strengthXpReceived = 0;

		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

		// adding xp and loot

		xpReceived += fish.xp * Qty1;
		if (Qty2 != 0) xpReceived += fish.xp2! * Qty2;
		if (Qty3 != 0) xpReceived += fish.xp3! * Qty3;

		if (fish.name === 'Barbarian fishing') {
			agilityXpReceived += 7 * Qty3 + 6 * Qty2 + 5 * Qty1;
			strengthXpReceived += 7 * Qty3 + 6 * Qty2 + 5 * Qty1;
		}


		// If they have the entire angler outfit, give an extra 0.5% xp bonus
		let bonusXP = 0;
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Fishing.anglerItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}


		let xpRes = await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: xpReceived,
			duration
		});
		xpRes +=
			agilityXpReceived > 0
				? await user.addXP({
					skillName: SkillsEnum.Agility,
					amount: agilityXpReceived,
					duration
				})
				: '';
		xpRes +=
			strengthXpReceived > 0
				? await user.addXP({
					skillName: SkillsEnum.Strength,
					amount: strengthXpReceived,
					duration
				})
				: '';


		const loot = new Bank();
		loot.add(fish.id3!, loot3);
		loot.add(fish.id2!, loot2);

		// handling stackable fish
		if (fish.name === 'Minnow') {
			let sum = 0;
			for (let i = 0; i < loot1; i++) {
				sum += Math.floor(Math.random() * (baseMinnow[1] - baseMinnow[0] + 1)) + baseMinnow[0];
			}
			loot1 = sum;
		} else if (fish.name === 'Karambwanji') {
			loot1 *= baseKarambwanji;
		}
		loot.add(fish.id, loot1);

		let str = ''

		const totalCatches = Qty1 + Qty2 + Qty3;
		str = `${user}, ${user.minionName} finished fishing ${totalCatches} ${fish.name}. ${xpRes}`;


		const cost = new Bank();
		if (spirit_flakes) {
			cost.add('Spirit flakes', flakesToRemove);
		}

		if (fish.bait) {
			cost.add(fish.bait, totalCatches);
		}

		await user.removeItemsFromBank(cost);

		// Add clue scrolls
		if (fish.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Fishing, totalCatches, fish.clueScrollChance, loot);
		}

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			bonusXP += Math.ceil(calcPercentOfNum(xpBonusPercent, xpReceived));
		}

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Roll for pet
		if (fish.petChance) {
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Fishing, fish.petChance);
			for (let i = 0; i < totalCatches; i++) {
				if (roll(petDropRate)) {
					loot.add('Heron');
					str += "\nYou have a funny feeling you're being followed...";
					globalClient.emit(
						Events.ServerNotification,
						`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${fishLvl} Fishing!`
					);
				}
			}
		}

		// bigFishQuantity add this 
		if (fish.bigFishRate && fish.bigFish) {
			let bigFishQuantity = 0;
			if (fish.name === 'Shark') {
				bigFishQuantity = Qty1;
			}
			if (fish.name === 'Tuna/Swordfish') {
				bigFishQuantity = Qty2;
			}
			if (fish.name === 'Mackerel/Cod/Bass') {
				bigFishQuantity = Qty3;
			}
			for (let i = 0; i < bigFishQuantity!; i++) {
				if (roll(fish.bigFishRate)) {
					loot.add(fish.bigFish);
				}
			}
		}


		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
}

