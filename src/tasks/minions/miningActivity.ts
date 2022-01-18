import { roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MiningActivityTaskOptions) {
		const { oreID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		const loot = new Bank();

		let xpReceived = quantity * ore.xp;
		if (ore.name === 'Sandstone') {
			xpReceived = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(100 / (1.2889 + Math.floor(0.184_56 * user.skillLevel(SkillsEnum.Mining))))) {
					xpReceived += 60;
					loot.add('Sandstone (10kg)');
				} else if (roll(100 / (4.889_31 + Math.floor(0.191_377 * user.skillLevel(SkillsEnum.Mining))))) {
					xpReceived += 50;
					loot.add('Sandstone (5kg)');
				} else if (roll(100 / (10.6549 + Math.floor(0.122_311 * user.skillLevel(SkillsEnum.Mining))))) {
					xpReceived += 40;
					loot.add('Sandstone (2kg)');
				} else {
					xpReceived += 30;
					loot.add('Sandstone (1kg)');
				}
			}
		} else if (ore.id === 1625) {
			// Gem rocks roll off the GemRockTable
			for (let i = 0; i < quantity; i++) {
				loot.add(Mining.GemRockTable.roll());
			}
		} else if (ore.id === 21_622) {
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
		} else {
			loot.add(ore.id, quantity);
		}
		let bonusXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			user.getGear('skilling').hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
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

		// Add clue scrolls
		if (ore.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Mining, quantity, ore.clueScrollChance, loot);
		}

		// Roll for pet
		if (ore.petChance && roll((ore.petChance - currentLevel * 25) / quantity)) {
			loot.add('Rock golem');
			str += "\nYou have a funny feeling you're being followed...";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
			);
		}

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.nuggets) {
			const numberOfNuggets = rand(0, Math.floor(numberOfMinutes / 4));
			loot.add('Golden nugget', numberOfNuggets);
		} else if (numberOfMinutes > 10 && ore.minerals) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot.add('Unidentified minerals', numberOfMinerals);
			}
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['mine', [quantity, ore.name], true],
			undefined,
			data,
			loot
		);
	}
}
