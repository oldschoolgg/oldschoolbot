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


function rollCatches(tripTicks, catchChance) {
	let catches = 0;
	let t = 0;
	let lootAmount = 0;
	let usefulTicks = (1-lostTicks)*tripTicks
	
	if (powerfishing) {
		while (t < usefulTicks) {
			if (Math.random() < catchChance) {
				catches++;
			}
			t += ticksPerRoll;
		}
		return {catches, lootAmount};
	} else {
		while (t < usefulTicks) {
			if (Math.random() < catchChance) {
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
			if (Math.random() < radasBoost) {
				lootAmount++;
			}
			if (Math.random() < 0.5) {
				lootAmount++;
				flakesQuantity--;
			}
		}
		
		return {catches, lootAmount};
	}

}

function catchChance(fish, fishLvl) {
	return fish.chance99 - (99-fishLvl)*(fish.chance99-fish.chance1)/(99-1);
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
		const { radasBoost } = radasBlessing(user);

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
		let fish1 = 0;
		let fish2 = 0;
		let fish3 = 0;
		
		let invSlots = 26;
		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			invSlots += 28;
		}

		let lostTicks = fish.lostTicks;
		let bankTime = fish.bankingTime;
		let ticksPerRoll = fish.ticksPerRoll;
	
		let numFish = 0;
		if (fish.name === 'Barbarian fishing') {
			if (powerfishing) {
				ticksPerRoll = 3;
			}
			if (user.allItemsOwned.has('Fishing cape') || user.allItemsOwned.has('Fishing cape (t)') || user.allItemsOwned.has('Max cape')) {
				bankTime = 20;
			}
			
			if (fishLvl >= 48 && stats.agility >= 15 && stats.strength >= 15) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Leaping trout')!;
				numFish++;
			}
			if (fishLvl >= 58 && stats.agility >= 30 && stats.strength >= 30)) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Leaping salmon')!;
				numFish++;
			}
			if (fishLvl >= 70 && stats.agility >= 45 && stats.strength >= 45) {
				const fish3 = Fishing.Fishes.find(fish => fish.id === 'Leaping sturgeon')!;
				numFish++;
			}
		
		} else if (fish.name === 'Shrimp/Anchovies') {
			if (fishLvl >= 1) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Raw shrimp')!;
				numFish++;
			}
			if (fishLvl >= 15) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Raw anchovies')!;
				numFish++;
			}
			
		} else if (fish.name === 'Sardine/Herring') {
			if (fishLvl >= 5) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Raw sardine')!;
				numFish++;
			}
			if (fishLvl >= 10) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Raw herring')!;
				numFish++;
			}
			
		} else if (fish.name === 'Trout/Salmon') {
			if (powerfishing) {
				ticksPerRoll = 3;
			}
			
			if (fishLvl >= 20) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Raw trout')!;
				numFish++;
			}
			if (fishLvl >= 30) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Raw salmon')!;
				numFish++;
			}

			
		} else if (fish.name === 'Tuna/Swordfish') {
			if (powerfishing) {
				ticksPerRoll = 2;
			}

			if (fishLvl >= 35) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Raw tuna')!;
				numFish++;
			}
			if (fishLvl >= 50) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Raw swordfish')!;
				numFish++;
			}

		} else if (fish.name === 'Big net') {
			if (fishLvl >= 16) {
				const fish1 = Fishing.Fishes.find(fish => fish.id === 'Raw mackerel')!;
				numFish++;
			}
			if (fishLvl >= 23) {
				const fish2 = Fishing.Fishes.find(fish => fish.id === 'Raw cod')!;
				numFish++;
			}
			if (fishLvl >= 46) {
				const fish3 = Fishing.Fishes.find(fish => fish.id === 'Raw bass')!;
				numFish++;
			}
		} else {
			if (fishLvl >= fish.level) {
				const fish1 = fish;
				numFish++;
			}
		}

 		if (fish.name === 'Tuna' || fish.name === 'Swordfish' || fish.name === 'Shark') {
			if (user.hasEquipped("Dragon harpoon")) {
				let harpoonBoost = 1.2;
			} else if (user.hasEquipped("Crystal harpoon")) {
				let harpoonBoost = 1.35;
			}
		} else {
			let harpoonBoost = 0;
		}
		
		// adding xp and loot
		let catches1 = 0, catches2 = 0, catches3  = 0;
		let lootAmount1 = 0, lootAmount2 = 0, lootAmount3 = 0;

		// roll the highest lvl fish first
		if (numFish >= 3) {
			let chance3 = fish3.maxChance - (99-fishLvl)*(fish3.maxChance-fish3.minChance)/(99-fish3.level);
			catches3, lootAmount3 = rollCatches(tripTicks, chance3*harpoonBoost);
			xpReceived += fish3.xp*catches3;
			tripTicks -= ticksPerRoll * catches3;
		}
		// roll for the 2nd fish only on the ticks that the 1st one wasn't caught
		if (numFish >= 2) {
			let chance2 = fish2.maxChance - (99-fishLvl)*(fish2.maxChance-fish2.minChance)/(99-fish2.level);
			catches2, lootAmount2 = rollCatches(tripTicks, chance2*harpoonBoost)];
			xpReceived += fish2.xp*catches2;
			tripTicks -= ticksPerRoll * catches2;
		}
		if (numFish >= 1) {
			let chance1 = fish1.maxChance - (99-fishLvl)*(fish1.maxChance-fish1.minChance)/(99-fish1.level);
			catches1, lootAmount1 = rollCatches(tripTicks, chance1*harpoonBoost);
			xpReceived += fish1.xp*catches1;
		}

		// handling stackable fish
		if (fish.name === 'Minnow'){
			let sum = 0;
			for (let i = 0; i < lootAmount1; i++) {
				sum += Math.floor(Math.random() * (baseMinnow[1]) - baseMinnow[0] + 1)) + baseMinnow[0];
			}
		} else if (fish.name === 'Karambwanji'){
			lootAmount1 *= baseKarambwanji;
		}

		let loot = [];
		if (!powerfishing) {
			loot.add(fish1.id, lootAmount1);
			loot.add(fish2.id, lootAmount2);
			loot.add(fish3.id, lootAmount3);
		}
	
		if (fish.name === 'Barbarian fishing') {
			agilityXpReceived  += 7*catches3 + 6*catches2 + 5*catches1;
			strengthXpReceived += 7*catches3 + 6*catches2 + 5*catches1;
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
