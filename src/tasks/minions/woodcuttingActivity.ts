import { Task } from 'klasa';

import { Emoji, Events, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { itemID, multiplyBank, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Woodcutting);

		const Log = Woodcutting.Logs.find(Log => Log.id === logID);

		if (!Log) return;

		const xpReceived = quantity * Log.xp;

		await user.addXP(SkillsEnum.Woodcutting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Woodcutting);

		let str = `${user}, ${user.minionName} finished Woodcutting ${quantity} ${
			Log.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Woodcutting level is now ${newLevel}!`;
		}

		let loot = {
			[Log.id]: quantity
		};

		if (duration > Time.Minute * 20 && roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}

		if (user.hasItemEquippedAnywhere(itemID('Woodcutting master cape'))) {
			loot = multiplyBank(loot, 2);
		}

		const minutes = duration / Time.Minute;
		if (roll(Math.floor(2000 / minutes))) {
			loot[itemID('Peky')] = 1;
			str += `<:peky:787028037031559168> A small pigeon has taken a liking to you, and hides itself in your bank.`;
		}

		// Add clue scrolls
		if (Log.clueScrollChance) {
			loot = addSkillingClueToLoot(
				user,
				SkillsEnum.Woodcutting,
				quantity,
				Log.clueScrollChance,
				loot
			);
		}

		// Roll for pet
		if (
			Log.petChance &&
			roll((Log.petChance - user.skillLevel(SkillsEnum.Woodcutting) * 25) / quantity)
		) {
			loot[itemID('Beaver')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user.username}'s** minion, ${user.minionName}, just received a Beaver while cutting ${Log.name} at level ${currentLevel} Woodcutting!`
			);
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
				return this.client.commands.get('chop')!.run(res, [quantity, Log.name]);
			},
			undefined,
			data,
			loot
		);
	}
}
