import { Time, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import type { MiningActivityTaskOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const miningTask: MinionTask = {
	type: 'Mining',
	async run(data: MiningActivityTaskOptions) {
		const { oreID, userID, channelID, duration, powermine } = data;
		const { quantity } = data;
		const user = await mUserFetch(userID);
		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}
		const currentLevel = user.skillLevel(SkillsEnum.Mining);
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${xpRes}`;

		const loot = new Bank();

		// Add clue scrolls
		if (ore.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Mining, quantity, ore.clueScrollChance, loot);
		}

		// Roll for pet
		if (ore.petChance) {
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Mining, ore.petChance);
			if (roll(petDropRate / quantity)) {
				loot.add('Rock golem');
				str += "\nYou have a funny feeling you're being followed...";
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
				);
			}
		}

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.minerals && user.skillLevel(SkillsEnum.Mining) >= 60) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot.add('Unidentified minerals', numberOfMinerals);
			}
		}

		let daeyaltQty = 0;

		if (!powermine) {
			// Gem rocks roll off the GemRockTable
			if (ore.name === 'Gem rock') {
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.GemRockTable.roll());
				}
			} else if (ore.name === 'Volcanic ash') {
				// Volcanic ash
				const userLevel = user.skillLevel(SkillsEnum.Mining);
				const tiers = [
					[22, 1],
					[37, 2],
					[52, 3],
					[67, 4],
					[82, 5],
					[97, 6]
				];
				for (const [lvl, multiplier] of tiers.reverse()) {
					if (userLevel >= lvl) {
						loot.add(ore.id, quantity * multiplier);
						break;
					}
				}
			} else if (ore.name === 'Sandstone') {
				// Sandstone roll off the SandstoneRockTable
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.SandstoneRockTable.roll());
				}
			} else if (ore.name === 'Granite') {
				// Granite roll off the GraniteRockTable
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.GraniteRockTable.roll());
				}
			} else if (ore.name === 'Daeyalt essence rock') {
				for (let i = 0; i < quantity; i++) {
					daeyaltQty += randInt(2, 3);
				}
				loot.add(ore.id, daeyaltQty);
			} else {
				loot.add(ore.id, quantity);
			}
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
