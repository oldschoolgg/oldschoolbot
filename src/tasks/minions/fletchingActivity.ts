import { KlasaMessage, Task } from 'klasa';

import { noOp, saidYes } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import Fletching from '../../lib/skilling/skills/fletching/fletching';

export default class extends Task {
	async run({
		fletchableName,
		quantity,
		userID,
		channelID,
		duration
	}: FletchingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Fletching);

		const fletchableItem = Fletching.Fletchables.find(
			fletchable => fletchable.name === fletchableName
		);

		if (!fletchableItem) return;

		const xpReceived = quantity * fletchableItem.xp;

		if (fletchableItem.outputMultiple) {
			quantity *= fletchableItem.outputMultiple;
		}

		await user.addXP(SkillsEnum.Fletching, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Fletching);

		let str = `${user}, ${user.minionName} finished fletching ${quantity} ${
			fletchableItem.name
		}s, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Fletching level is now ${newLevel}!`;
		}

		const loot = {
			[fletchableItem.id]: quantity
		};

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
						user.log(
							`continued trip of ${quantity}x ${fletchableItem.name}[${fletchableItem.id}]`
						);
						this.client.commands
							.get('fletch')!
							.run(response as KlasaMessage, [quantity, fletchableItem.name]);
					}
				})
				.catch(noOp);
		});
	}
}
