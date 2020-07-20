import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import Magic from '../../lib/skilling/skills/Magic/magic';

export default class extends Task {
	async run({ castableName, quantity, userID, channelID, duration }: CastingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Fletching);

		const castableItem = Magic.Castables.find(castable => castable.name === castableName);

		if (!castableItem) return;

		const xpReceived = quantity * castableItem.magicxp;

		if (castableItem.outputMultiple) {
			quantity *= castableItem.outputMultiple;
		}

		await user.addXP(SkillsEnum.Magic, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Magic);

		let str = `${user}, ${user.minionName} finished casting ${quantity} ${
			castableItem.name
		}s, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Magic level is now ${newLevel}!`;
		}

		if (castableItem.id) {
			const loot = {
				[castableItem.id]: quantity
			};

			await user.addItemsToBank(loot, true);
		}

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
							`continued trip of ${quantity}x ${castableItem.name}[${castableItem.id}]`
						);
						this.client.commands
							.get('cast')!
							.run(response as KlasaMessage, [quantity, castableItem.name]);
					}
				})
				.catch(noOp);
		});
	}
}
