import { calcPercentOfNum, percentChance, randInt } from 'e';
import { Bank } from 'oldschooljs';
import { z } from 'zod';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import { anglerBoostPercent } from '../../mahoji/mahojiSettings';

function radasBlessing(user: MUser) {
	const blessingBoosts = [
		["Rada's blessing 4", 1.08],
		["Rada's blessing 3", 1.06],
		["Rada's blessing 2", 1.04],
		["Rada's blessing 1", 1.02]
	];

	for (const [itemName, boostPercent] of blessingBoosts) {
		if (user.hasEquipped(itemName)) {
			return { blessingChance: boostPercent as number };
		}
	}
	return { blessingChance: 1.00 };
}


function rollCatches(catchChance) {
	let catches = 0;
	let t = 0;

	if (powerfishing) {
		while (t < tripTicks) {
			if (Math.random() < catchChance) {
				catches++;
			}
			t += 5;
		}
	} else {
		while (t < tripTicks) {
			if (Math.random() < catchChance) {
				catches++;
			}
			t += 5;
			if (catches % invSlots === 0) {
				t += bankTime;
			}
		}
	}

	return catches;
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
		const { fishID, userID, channelID, tripTicks, powerfishing, flakes} = data;
		const user = await mUserFetch(userID);
		const fishLvl = user.skillLevel(SkillsEnum.Fishing);
		const { radaBoost } = radasBlessing(user);

		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

		const minnowQuantity: { [key: number]: number[] } = {
			99: [10, 14],
			95: [11, 13],
			90: [10, 13],
			85: [10, 11],
			1: [10, 10]
		};

		let xpReceived = 0;
		let fish1 = 0;
		let fish2 = 0;
		let fish3 = 0;
		let agilityXpReceived = 0;
		let strengthXpReceived = 0;

		let invSlots = 26
		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			invSlots += 28;
		}

		let bankTime = fish.bankingTime;

		let loot = []
		
		if (fish.name === 'Barbarian fishing') {
			if (powerfishing) {
					tripTicks *= 5/3 // same effect as getting one roll every 3 ticks instead of 5
				}
			
			if (fishLvl >= 70 && stats.agility >= 45 && stats.strength >= 45) {
				const sturgeonChance = 0.2539 - (99-fishLvl)*(0.2539-0.1875)/(99-70)
				const salmonChance   = 0.2827 - (99-fishLvl)*(0.2827-0.2317)/(99-70)
				const troutChance    = 0.3494 - (99-fishLvl)*(0.3494-0.3312)/(99-70)

				fish3 = rollCatches(sturgeonChance)
				fish2 = rollCatches(salmonChance)
				fish1 = rollCatches(troutChance)
				
				xpReceived += 80*fish3 + 70*fish2 + 50*fish1;
				agilityXpReceived  += 7*fish3 + 6*fish2 + 5*fish1;
				strengthXpReceived += 7*fish3 + 6*fish2 + 5*fish1;
				
			} else if (fishLvl >= 58 && stats.agility >= 30 && stats.strength >= 30)) {
				const salmonChance = 0.2852 - (69-fishLvl)*(0.2852-0.2500)/(69-58)
				const troutChance  = 0.4021 - (69-fishLvl)*(0.4021-0.3691)/(69-58)

				fish2 = rollCatches(salmonChance)
				fish1 = rollCatches(troutChance)
				
				xpReceived += 70*fish2 + 50*fish1;
				agilityXpReceived  += 6*fish2 + 5*fish1;
				strengthXpReceived += 6*fish2 + 5*fish1;
				
			} else if (fishLvl >= 48 && stats.agility >= 15 && stats.strength >= 15) {
				const troutChance  = 0.4844 - (57-fishLvl)*(0.4844-0.4297)/(57-48)

				fish1 = rollCatches(troutChance)
				
				xpReceived += 50*fish1;
				agilityXpReceived  += 5*fish1;
				strengthXpReceived += 5*fish1;
			}
			if (!powerfishing) {
				loot.add('Leaping sturgeon', fish3*radaBoost);
				loot.add('Leaping salmon',   fish2*radaBoost);
				loot.add('Leaping trout',    fish1*radaBoost);
			}
			
		} else if (fish.name === 'Shrimp/Anchovies') {
			if (fishLvl >= 14) {
				const anchovyChance = 0.5039 - (99-fishLvl)*(0.5039-0.1523)/(99-14)
				const shrimpChance  = 0.4961 - (99-fishLvl)*(0.4961-0.2604)/(99-14)

				fish2 = rollCatches(quantity, anchovyChance)
				fish1 = rollCatches(quantity, shrimpChance)
				
				xpReceived += 40*fish2 + 10*fish1;
			} else {
				const shrimpChance  = 0.4961 - (99-fishLvl)*(0.4961-0.2604)/(99-14)

				fish1 = rollCatches(quantity, shrimpChance)
				
				xpReceived += 40*fish2 + 10*fish1;
			}
			if (!powerfishing) {
				loot.add('Raw anchovies', fish2*radaBoost);
				loot.add('Raw shrimp',    fish1*radaBoost);
			}
			
		} else if (fish.name === 'Sardine/Herring') {
			if (fishLvl >= 10) {
				const herringChance = 0.5039 - (99-fishLvl)*(0.5039-0.1367)/(99-10)
				const sardineChance = 0.3740 - (99-fishLvl)*(0.3740-0.1619)/(99-10)

				fish2 = rollCatches(quantity, herringChance)
				fish1 = rollCatches(quantity, sardineChance)
				
				xpReceived += 30*fish2 + 20*fish1;
			} else if (fishLvl >= 5) {
				const sardineChance  = 0.1797 - (10-fishLvl)*(0.1797-0.1563)/(10-5)

				fish1 = rollCatches(quantity, shrimpChance)
				
				xpReceived += 20*fish1;
			}
			if (!powerfishing) { 
				loot.add('Raw herring', fish2*radaBoost);
				loot.add('Raw sardine', fish1*radaBoost);
			}
			
		} else if (fish.name === 'Trout/Salmon') {
			if (fishLvl >= 30) {
				const salmonChance = 0.3789 - (99-fishLvl)*(0.3789-0.2625)/(99-30)
				const troutChance  = 0.4682 - (99-fishLvl)*(0.4682-0.1602)/(99-30)

				fish2 = rollCatches(quantity, salmonChance)
				fish1 = rollCatches(quantity, troutChance)
				
				xpReceived += 70*fish2 + 50*fish1;
			} else if (fishLvl >= 20) {
				const troutChance  = 0.3086 - (29-fishLvl)*(0.3086-0.2500)/(29-20)

				fish1 = rollCatches(quantity, troutChance)
				
				xpReceived += 50*fish1;
			}
			if (!powerfishing) {
				loot.add('Raw salmon', fish2*radaBoost);
				loot.add('Raw trout',  fish1*radaBoost);
			}
			
		} else if (fish.name === 'Tuna/Swordfish') {
			if (powerfishing) {
					tripTicks *= 5/2 // same effect as getting one roll every 2 ticks instead of 5
				}
			
			if (fishLvl >= 50) {
				let swordfishChance = 0.1914 - (99-fishLvl)*(0.1914-0.1055)/(99-50)
				let tunaChance      = 0.2053 - (99-fishLvl)*(0.2053-0.1293)/(99-50)
				
				if (user.hasEquipped("Dragon harpoon")) {
					swordfishChance *= 1.2
					tunaChance 		*= 1.2
				} else if (user.hasEquipped("Crystal harpoon")) {
					swordfishChance *= 1.35
					tunaChance 		*= 1.35
				}
				
				fish2 = rollCatches(quantity, swordfishChance)
				fish1 = rollCatches(quantity, tunaChance)
				
				xpReceived += 100*fish2 + 80*fish1;
			} else if (fishLvl >= 35) {
				let tunaChance  = 0.1406 - (29-fishLvl)*(0.1406-0.1094)/(49-35)
	
				if (user.hasEquipped("Dragon harpoon")) {
					tunaChance 		*= 1.2
				} else if (user.hasEquipped("Crystal harpoon")) {
					tunaChance 		*= 1.35
				}
				
				fish1 = rollCatches(tunaChance)
				
				xpReceived += 80*fish1;
			}
			if (!powerfishing) {
				loot.add('Raw swordfish', fish2*radaBoost);
				loot.add('Raw tune', 	  fish1*radaBoost);
			}
		} else {
			let catchChance = fish.maxChance- (99-fishLvl)*(fish.maxChance-fish.minChance)/(99-fish.level)

			if (fish.name === 'Shark'){
				if (user.hasEquipped("Dragon harpoon")) {
					catchChance *= 1.2
				} else if (user.hasEquipped("Crystal harpoon")) {
					catchChance *= 1.35
				}
			}
			
			fish1 = rollCatches(catchChance)
			xpReceived += fish.xp*fish1
		
			if (!powerfishing) {
				loot.add(fish.id, fish1*radaBoost);
			}
			
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

		let str = `${user}, ${user.minionName} finished fishing ${quantity} ${fish.name}. ${xpRes}`;

		let lootQuantity = 0;
		const baseKarambwanji = 1 + Math.floor(user.skillLevel(SkillsEnum.Fishing) / 5);
		let baseMinnow = [10, 10];
		for (const [level, quantities] of Object.entries(minnowQuantity).reverse()) {
			if (user.skillLevel(SkillsEnum.Fishing) >= Number.parseInt(level)) {
				baseMinnow = quantities;
				break;
			}
		}

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
						`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${currentLevel} Fishing!`
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

		if (powerfish) {
			let loot = []
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
};
