import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MAX_LEVEL, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Firemaking from '../../lib/skilling/skills/firemaking';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const log = Woodcutting.Logs.find(Log => Log.id === logID)!;
		let clueChance = log.clueScrollChance;
		let xpReceived = quantity * log.xp;
		if (logID === itemID('Elder logs')) {
			const userWcLevel = user.skillLevel(SkillsEnum.Woodcutting);
			// Bring it as close as possible to Rocktails
			if (userWcLevel >= MAX_LEVEL) clueChance = 13_011;
			xpReceived *= 2;
		}
		let bonusXP = 0;

		// If they have the entire lumberjack outfit, give an extra 0.5% xp bonus
		if (
			user.getGear('skilling').hasEquipped(
				Object.keys(Woodcutting.lumberjackItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each lumberjack item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Woodcutting.lumberjackItems)) {
				if (user.getGear('skilling').hasEquipped([parseInt(itemID)], false)) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Woodcutting,
			amount: xpReceived,
			duration
		});

		let loot = new Bank().add(log.id, quantity);
		const logItem = Firemaking.Burnables.find(i => i.inputLogs === log.id);
		if (user.hasItemEquippedAnywhere('Inferno adze') && logItem) {
			loot.remove(log.id, quantity);
			loot.add('Ashes', quantity);
			xpRes += '\n';
			xpRes += await user.addXP({
				skillName: SkillsEnum.Firemaking,
				amount: logItem.xp * quantity,
				duration
			});
		}

		if (user.hasItemEquippedAnywhere('Woodcutting master cape')) {
			loot.multiply(2);
		}

		// Add clue scrolls
		if (clueChance) addSkillingClueToLoot(user, SkillsEnum.Woodcutting, quantity, clueChance, loot);

		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}`;

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (roll(Math.floor(4000 / minutes))) {
				loot.add('Peky');
				str +=
					'\n<:peky:787028037031559168> A small pigeon has taken a liking to you, and hides itself in your bank.';
			}
		}

		// Roll for pet
		if (log.petChance && roll((log.petChance - user.skillLevel(SkillsEnum.Woodcutting) * 25) / quantity)) {
			loot.add('Beaver');
			str += "\n**You have a funny feeling you're being followed...**";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Beaver while cutting ${log.name} at level ${user.skillLevel(
					SkillsEnum.Woodcutting
				)} Woodcutting!`
			);
		}
		if (bonusXP > 0) {
			str += `. **Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		str += `\nYou received ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, ['chop', { name: log.name, quantity }, true], undefined, data, loot);
	}
}
