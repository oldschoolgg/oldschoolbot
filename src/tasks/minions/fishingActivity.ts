//import { calcPercentOfNum, percentChance, randInt } from 'e';
import { calcPercentOfNum } from 'e';
import { Bank } from 'oldschooljs';
import { z } from 'zod';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../lib/skilling/skills/fishing';
import { Fish, SkillsEnum } from '../../lib/skilling/types';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import { anglerBoostPercent } from '../../mahoji/mahojiSettings';

function radasBlessing(user: MUser) {
	const blessingBoosts = [
		["Rada's blessing 4", 8],
		["Rada's blessing 3", 6],
		["Rada's blessing 2", 4],
		["Rada's blessing 1", 2]
	];

	for (const [itemName, boostPercent] of blessingBoosts) {
		if (user.hasEquipped(itemName)) {
			return { blessingEquipped: true, blessingChance: boostPercent as number };
		}
	}
	return { blessingEquipped: false, blessingChance: 0 };
}


function rollCatches(
	tripTicks: number,
	chance: number,
	powerfish: boolean,
	spirit_flakes: boolean,
	lostTicks: number,
	ticksPerRoll: number,
	invSlots: number,
	bankTime: number,
	blessingChance: number,
	flakesQuantity: number,
) {
	let catches = 0;
	let t = 0;
	let lootAmount = 0;
	let usefulTicks = (1 - lostTicks) * tripTicks
	let flakesUsed = 0;

	if (powerfish) {
		while (t < usefulTicks) {
			if (Math.random() < chance) {
				catches++;
			}
			t += ticksPerRoll;
		}
		return { catches, lootAmount, flakesUsed };
	} else {
		while (t < usefulTicks) {
			if (Math.random() < chance) {
				catches++;
			}
			t += ticksPerRoll;

			if (catches % invSlots === 0) {
				t += bankTime;
			}
		}

		lootAmount += catches;
		// extra loot
		let i = 0;
		while (i < catches) {
			if (Math.random() < blessingChance / 100) {
				lootAmount++;
			}
			if (spirit_flakes && flakesUsed < flakesQuantity) {
				if (Math.random() < 0.5) {
					lootAmount++;
					flakesUsed++;
				}
			}
			i++;
		}


		return { catches, lootAmount, flakesUsed };
	}

}

function catchChance(fish: Fish, fishLvl: number) {
	return fish.chance99! - (99 - fishLvl) * (fish.chance99! - fish.chance1!) / (99 - 1);
}

const allFishIDs = Fishing.Fishes.map(fish => fish.id);

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
		let { fishID, userID, channelID, duration, tripTicks, powerfish, spirit_flakes } = data;
		powerfish = powerfish ?? false;
		spirit_flakes = spirit_flakes ?? false;

		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);
		const agiLvl = user.skillLevel(SkillsEnum.Agility);
		const strLvl = user.skillLevel(SkillsEnum.Strength);

		const { blessingEquipped, blessingChance } = radasBlessing(user);

		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

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

		let invSlots = 26;
		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			invSlots += 28;
		}

		let lostTicks = fish.lostTicks;
		let bankTime = fish.bankingTime;
		let ticksPerRoll = fish.ticksPerRoll;

		let fish1 = null;
		let fish2 = null;
		let fish3 = null;

		if (fish.name === 'Barbarian fishing' || fish.name === 'Leaping trout' || fish.name === 'Leaping salmon' || fish.name === 'Leaping sturgeon') {
			if (powerfish) {
				ticksPerRoll = 3;
				lostTicks = 0.02; // more focused
			}
			if (user.allItemsOwned.has('Fishing cape') || user.allItemsOwned.has('Fishing cape (t)') || user.allItemsOwned.has('Max cape')) {
				bankTime = 20;
			}

			if (fishLvl >= 48 && agiLvl >= 15 && strLvl >= 15) {
				fish1 = Fishing.Fishes.find(fish => fish.name === 'Leaping trout')!;
			}
			if (fishLvl >= 58 && agiLvl >= 30 && strLvl >= 30) {
				fish2 = Fishing.Fishes.find(fish => fish.name === 'Leaping salmon')!;
			}
			if (fishLvl >= 70 && agiLvl >= 45 && strLvl >= 45) {
				fish3 = Fishing.Fishes.find(fish => fish.name === 'Leaping sturgeon')!;
			}

		} else if (fish.name === 'Big net fishing' || fish.name === 'Mackerel' || fish.name === 'Cod' || fish.name === 'Bass') {
			if (fishLvl >= 16) {
				fish1 = Fishing.Fishes.find(fish => fish.id === itemID('Raw mackerel'))!;
			}
			if (fishLvl >= 23) {
				fish2 = Fishing.Fishes.find(fish => fish.id === itemID('Raw cod'))!;
			}
			if (fishLvl >= 46) {
				fish3 = Fishing.Fishes.find(fish => fish.id === itemID('Raw bass'))!;
			}
		} else if (fish.name === 'Shrimps' || fish.name === 'Anchovies') {
			if (fishLvl >= 1) {
				fish1 = Fishing.Fishes.find(fish => fish.id === itemID('Raw shrimps'))!;
			}
			if (fishLvl >= 15) {
				fish2 = Fishing.Fishes.find(fish => fish.id === itemID('Raw anchovies'))!;
			}

		} else if (fish.name === 'Sardine' || fish.name === 'Herring') {
			if (fishLvl >= 5) {
				fish1 = Fishing.Fishes.find(fish => fish.id === itemID('Raw sardine'))!;
			}
			if (fishLvl >= 10) {
				fish2 = Fishing.Fishes.find(fish => fish.id === itemID('Raw herring'))!;
			}

		} else if (fish.name === 'Trout' || fish.name === 'Salmon') {
			if (powerfish) {
				ticksPerRoll = 3;
				lostTicks = 0.03;
			}

			if (fishLvl >= 20) {
				fish1 = Fishing.Fishes.find(fish => fish.id === itemID('Raw trout'))!;
			}
			if (fishLvl >= 30) {
				fish2 = Fishing.Fishes.find(fish => fish.id === itemID('Raw salmon'))!;
			}


		} else if (fish.name === 'Tuna' || fish.name === 'Swordfish') {
			if (powerfish) {
				ticksPerRoll = 2;
				lostTicks = 0.01;
			}

			if (fishLvl >= 35) {
				fish1 = Fishing.Fishes.find(fish => fish.id === itemID('Raw tuna'))!;
			}
			if (fishLvl >= 50) {
				fish2 = Fishing.Fishes.find(fish => fish.id === itemID('Raw swordfish'))!;
			}

		} else {
			fish1 = fish;
		}

		let harpoonBoost = 1.0;
		if (fish.name === 'Tuna' || fish.name === 'Swordfish' || fish.name === 'Shark') {
			if (user.hasEquipped("Dragon harpoon")) {
				harpoonBoost = 1.2;
			} else if (user.hasEquipped("Crystal harpoon")) {
				harpoonBoost = 1.35;
			}
		} else {
			harpoonBoost = 1.0;
		}

		// adding xp and loot

		const loot = new Bank();

		let catches1 = 0, catches2 = 0, catches3 = 0;
		let lootAmount1 = 0, lootAmount2 = 0, lootAmount3 = 0;
		let flakes1 = 0, flakes2 = 0, flakes3 = 0;
		let flakesQuantity = user.bank.amount('Spirit flakes');

		// roll the highest lvl fish first
		if (fish3) {
			let chance3 = catchChance(fish3, fishLvl) * harpoonBoost;
			({ catches: catches3, lootAmount: lootAmount3, flakesUsed: flakes3 } = rollCatches(tripTicks, chance3, powerfish, spirit_flakes, lostTicks!, ticksPerRoll!, invSlots, bankTime!, blessingChance, flakesQuantity));
			xpReceived += fish3!.xp * catches3;
			tripTicks -= ticksPerRoll! * catches3;
			if (!powerfish) {
				loot.add(fish3!.id, lootAmount3);
			}

		}
		// roll for the other fish only on the ticks that the previous ones weren't caught
		if (fish2) {
			let chance2 = catchChance(fish2, fishLvl) * harpoonBoost;
			({ catches: catches2, lootAmount: lootAmount2, flakesUsed: flakes2 } = rollCatches(tripTicks, chance2, powerfish, spirit_flakes, lostTicks!, ticksPerRoll!, invSlots, bankTime!, blessingChance, flakesQuantity));
			xpReceived += fish2!.xp * catches2;
			tripTicks -= ticksPerRoll! * catches2;
			if (!powerfish) {
				loot.add(fish2!.id, lootAmount2);
			}
		}
		if (fish1) {
			let chance1 = catchChance(fish1, fishLvl) * harpoonBoost;
			({ catches: catches1, lootAmount: lootAmount1, flakesUsed: flakes1 } = rollCatches(tripTicks, chance1, powerfish, spirit_flakes, lostTicks!, ticksPerRoll!, invSlots, bankTime!, blessingChance, flakesQuantity));
			xpReceived += fish1!.xp * catches1;
			if (!powerfish) {
				// handling stackable fish
				if (fish.name === 'Minnow') {
					let sum = 0;
					for (let i = 0; i < lootAmount1; i++) {
						sum += Math.floor(Math.random() * (baseMinnow[1] - baseMinnow[0] + 1)) + baseMinnow[0];
					}
					lootAmount1 = sum;
				} else if (fish.name === 'Karambwanji') {
					lootAmount1 *= baseKarambwanji;
				}
				loot.add(fish1!.id, lootAmount1);
			}



			if (fish.name === 'Barbarian fishing') {
				agilityXpReceived += 7 * catches3 + 6 * catches2 + 5 * catches1;
				strengthXpReceived += 7 * catches3 + 6 * catches2 + 5 * catches1;
			}

			let bonusXP = 0;
			// If they have the entire angler outfit, give an extra 0.5% xp bonus
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


			let str = ''
			const quantity = catches1 + catches2 + catches3

			// barb and big net fishing handled separately 
			if (fish.name === 'Barbarian fishing' || fish.name === 'Big net fishing') {
				str = `${user}, ${user.minionName} finished fishing ${quantity} ${fish.name}. ${xpRes}`;
			} else if (fish2) {
				str = `${user}, ${user.minionName} finished fishing ${quantity} ${fish2!.name}/${fish1!.name}. ${xpRes}`;
			} else if (fish1) {
				str = `${user}, ${user.minionName} finished fishing ${quantity} ${fish1!.name}. ${xpRes}`;
			}

			const flakesToRemove = flakes1 + flakes2 + flakes3

			const cost = new Bank();
			if (spirit_flakes) {
				cost.add('Spirit flakes', flakesToRemove);
			}

			if (fish.bait) {
				cost.add(fish.bait, quantity);
			}

			await user.removeItemsFromBank(cost);

			// Add clue scrolls
			if (fish.clueScrollChance) {
				addSkillingClueToLoot(user, SkillsEnum.Fishing, quantity, fish.clueScrollChance, loot);
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
				for (let i = 0; i < quantity; i++) {
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

			if (fish.bigFishRate && fish.bigFish) {
				for (let i = 0; i < quantity; i++) {
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

			if (blessingEquipped) {
				str += `\nYour Rada's Blessing gives ${blessingChance}% chance of extra fish.`;
			}

			handleTripFinish(user, channelID, str, undefined, data, loot);
		}
	}
}
