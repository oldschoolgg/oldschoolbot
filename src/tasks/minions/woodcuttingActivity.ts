import { Task } from 'klasa';

import { Emoji, Events } from '../../lib/constants';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import itemID from '../../lib/util/itemID';
import { SkillsEnum } from '../../lib/skilling/types';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { roll } from '../../lib/util';

export default class extends Task {
	async run({ logID, quantity, userID, channelID, duration }: WoodcuttingActivityTaskOptions) {
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

		const loot = {
			[Log.id]: quantity
		};

		// roll for pet
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

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
			this.client.commands.get('chop')!.run(res, [quantity, Log.name]);
		});
	}
}
