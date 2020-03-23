import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Firemaking from '../../lib/skills/firemaking';
import { channelIsSendable } from '../../lib/util/channelIsSendable';

export default class extends Task {
	async run({ logID, quantity, userID, channelID }: FiremakingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);

		const Log = Firemaking.Logs.find(Log => Log.id === logID);

		if (!Log) return;

		const xpReceived = quantity * Log.xp;

		await user.addXP(SkillsEnum.Firemaking, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		let str = `${user}, ${user.minionName} finished Firemaking ${quantity} ${
			Log.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}

		const loot = {
			[Log.id]: quantity
		};

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
						user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
						this.client.commands
							.get('light')!
							.run(response as KlasaMessage, [quantity, Log.name]);
					}
				})
				.catch(noOp);
		});
	}
}
