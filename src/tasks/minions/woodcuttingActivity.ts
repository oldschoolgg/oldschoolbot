import { KlasaMessage, Task } from 'klasa';
import { roll } from 'oldschooljs/dist/util/util';

import { noOp, saidYes } from '../../lib/util';
import { Emoji, Events, Time } from '../../lib/constants';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { SkillsEnum } from '../../lib/skilling/types';

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
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

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

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;
						user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
						this.client.commands
							.get('chop')!
							.run(response as KlasaMessage, [quantity, Log.name]);
					}
				})
				.catch(noOp);
		});
	}
}
