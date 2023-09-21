import { randInt, Time } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MAX_LEVEL, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Firemaking from '../../lib/skilling/skills/firemaking';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { Log, SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, itemID, perTimeUnitChance, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

function handleForestry({ log, duration, loot }: { log: Log; duration: number; loot: Bank }) {
	if (resolveItems(['Redwood logs', 'Logs']).includes(log.id)) return;

	perTimeUnitChance(duration, 20, Time.Minute, () => {
		loot.add('Anima-infused bark', randInt(500, 1000));
	});
}

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

		// If they have the entire lumberjack outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Woodcutting.lumberjackItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each lumberjack item, check if they have it, give its XP boost if so.
			for (const [itemID, bonus] of Object.entries(Woodcutting.lumberjackItems)) {
				if (user.gear.skilling.hasEquipped([parseInt(itemID)], false)) {
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

		let loot = new Bank();

		handleForestry({ log, duration, loot });

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

		if (user.hasEquipped('Woodcutting master cape')) {
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

		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}`;

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			const droprate = clAdjustedDroprate(user, 'Peky', Math.floor(4000 / minutes), 1.5);
			if (roll(droprate)) {
				loot.add('Peky');
				str +=
					'\n<:peky:787028037031559168> A small pigeon has taken a liking to you, and hides itself in your bank.';
			}
		}

		if (strungRabbitFoot && !log.clueNestsOnly) {
			str += "\nYour strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.";
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

		str += `\nYou received ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
