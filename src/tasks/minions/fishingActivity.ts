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
		const { fishID, quantity, userID, channelID, duration } = data;
		let { flakesQuantity } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		const { blessingEquipped, blessingChance } = radasBlessing(user);

		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

		const minnowQuantity: { [key: number]: number[] } = {
			99: [10, 14],
			95: [11, 13],
			90: [10, 13],
			85: [10, 11],
			1: [10, 10]
		};

		let xpReceived = 0;
		let leapingSturgeon = 0;
		let leapingSalmon = 0;
		let leapingTrout = 0;
		let agilityXpReceived = 0;
		let strengthXpReceived = 0;

		const stats = user.skillsAsLevels;
		const canGetSturgeon = stats.fishing >= 70 && stats.agility >= 45 && stats.strength >= 45;
		const canGetSalmon = stats.fishing >= 58 && stats.agility >= 30 && stats.strength >= 30;
		const sturgeonChance = 255 / (8 + Math.floor(0.5714 * stats.fishing));
		const salmonChance = 255 / (16 + Math.floor(0.8616 * stats.fishing));
		const leapingChance = 255 / (32 + Math.floor(1.632 * stats.fishing));

		if (fish.name === 'Barbarian fishing') {
			for (let i = 0; i < quantity; i++) {
				if (canGetSturgeon && roll(sturgeonChance)) {
					xpReceived += 80;
					leapingSturgeon += blessingEquipped && percentChance(blessingChance) ? 2 : 1;
					agilityXpReceived += 7;
					strengthXpReceived += 7;
				} else if (canGetSalmon && roll(salmonChance)) {
					xpReceived += 70;
					leapingSalmon += blessingEquipped && percentChance(blessingChance) ? 2 : 1;
					agilityXpReceived += 6;
					strengthXpReceived += 6;
				} else if (roll(leapingChance)) {
					xpReceived += 50;
					leapingTrout += blessingEquipped && percentChance(blessingChance) ? 2 : 1;
					agilityXpReceived += 5;
					strengthXpReceived += 5;
				}
			}
		} else {
			xpReceived = quantity * fish.xp;
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

		for (let i = 0; i < quantity; i++) {
			if (fish.id === itemID('Raw karambwanji')) {
				lootQuantity +=
					blessingEquipped && percentChance(blessingChance) ? baseKarambwanji * 2 : baseKarambwanji;
			} else if (fish.id === itemID('Minnow')) {
				lootQuantity +=
					blessingEquipped && percentChance(blessingChance)
						? randInt(baseMinnow[0], baseMinnow[1]) * 2
						: randInt(baseMinnow[0], baseMinnow[1]);
			} else {
				lootQuantity += blessingEquipped && percentChance(blessingChance) ? 2 : 1;
			}

			if (flakesQuantity && flakesQuantity > 0) {
				lootQuantity += percentChance(50) ? 1 : 0;
				flakesQuantity--;
			}
		}

		const loot = new Bank({
			[fish.id]: lootQuantity
		});

		// Add clue scrolls
		if (fish.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Fishing, quantity, fish.clueScrollChance, loot);
		}

		// Add barbarian fish to loot
		if (fish.name === 'Barbarian fishing') {
			loot.remove(fish.id, loot.amount(fish.id));
			loot.add('Leaping sturgeon', leapingSturgeon);
			loot.add('Leaping salmon', leapingSalmon);
			loot.add('Leaping trout', leapingTrout);
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
