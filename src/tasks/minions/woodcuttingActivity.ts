import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MAX_LEVEL, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Firemaking from '../../lib/skilling/skills/firemaking';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, itemID, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const woodcuttingTask: MinionTask = {
	type: 'Woodcutting',
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration, powerchopping } = data;
		const user = await mUserFetch(userID);

		const log = Woodcutting.Logs.find(Log => Log.id === logID)!;
		let clueChance = log.clueScrollChance;

		let strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		let xpReceived = quantity * log.xp;
		if (logID === itemID('Elder logs')) {
			const userWcLevel = user.skillLevel(SkillsEnum.Woodcutting);
			// Bring it as close as possible to Rocktails
			if (userWcLevel >= MAX_LEVEL) clueChance = 13_011;
		}
		let bonusXP = 0;
		let lostLogs = 0;
		let loot = new Bank();
		let itemsToRemove = new Bank();

		// If they have the entire lumberjack outfit, give an extra 0.5% xp bonus
		if (
			user.hasEquippedOrInBank(
				Object.keys(Woodcutting.lumberjackItems).map(i => parseInt(i)),
				'every'
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each lumberjack item, check if they have it, give its XP boost if so
			for (const [itemID, bonus] of Object.entries(Woodcutting.lumberjackItems)) {
				if (user.hasEquippedOrInBank(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Woodcutting,
			amount: Math.ceil(xpReceived),
			duration
		});

		// Add Logs or loot
		if (!powerchopping) {
			if (log.lootTable) {
				loot.add(log.lootTable.roll(quantity));
			} else if (!log.hasNoLoot) {
				loot.add(log.id, quantity);
				const logItem = Firemaking.Burnables.find(i => i.inputLogs === log.id);
				if (user.hasEquipped('Inferno adze') && logItem) {
					loot.remove(log.id, quantity);
					loot.add('Ashes', quantity);
					xpRes += '\n';
					xpRes += await user.addXP({
						skillName: SkillsEnum.Firemaking,
						amount: logItem.xp * quantity,
						duration
					});
				}
			}
		}

		if (user.hasEquippedOrInBank('Woodcutting master cape')) {
			loot.multiply(2);
		}

		// Add clue scrolls
		if (clueChance) {
			addSkillingClueToLoot(
				user,
				SkillsEnum.Woodcutting,
				quantity,
				clueChance,
				loot,
				log.clueNestsOnly,
				strungRabbitFoot
			);
		}

		// End of trip message
		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}${
			bonusXP > 0 ? ` **Bonus XP:** ${bonusXP.toLocaleString()}` : ''
		}\n`;

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			const droprate = clAdjustedDroprate(user, 'Peky', Math.floor(4000 / minutes), 1.5);
			if (roll(droprate)) {
				loot.add('Peky');
				str +=
					'\n<:peky:787028037031559168> A small pigeon has taken a liking to you, and hides itself in your bank.';
			}
		}
		// Roll for pet
		if (log.petChance) {
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Woodcutting, log.petChance);
			if (roll(petDropRate / quantity)) {
				loot.add('Beaver');
				str += "\n**You have a funny feeling you're being followed...**";
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Woodcutting} **${user.badgedUsername}'s** minion, ${
						user.minionName
					}, just received a Beaver while cutting ${log.name} at level ${user.skillLevel(
						'woodcutting'
					)} Woodcutting!`
				);
			}
		}
		if (bonusXP > 0) {
			str += `. **Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Loot received, items used, and logs/loot rolls lost message
		str += `\nYou received ${loot}. `;
		str += `${itemsToRemove.length > 0 ? `You used ${itemsToRemove}. ` : ''}`;
		str += `${
			lostLogs > 0 && !powerchopping
				? `You lost ${
						log.lootTable ? `${lostLogs}x ${log.name} loot rolls` : `${lostLogs}x ${log.name}`
				  } due to using a felling axe.`
				: ''
		}`;

		// Update cl, give loot, and remove items used
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot,
			itemsToRemove
		});

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
