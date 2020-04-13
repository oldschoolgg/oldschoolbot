import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithedActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

import { channelIsSendable } from '../../lib/util/channelIsSendable';
import Smithing from '../../lib/skilling/skills/smithedItems';

export default class extends Task {
	async run({ smithedBarID, quantity, userID, channelID }: SmithedActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const SmithedBar = Smithing.SmithedBars.find(SmithedBar => SmithedBar.id === smithedBarID);
		if (!SmithedBar) return;

		const xpReceived = quantity * SmithedBar.xp;

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smithing ${quantity *
			SmithedBar.outputMultiple}x ${
			SmithedBar.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		const loot = {
			[SmithedBar.id]: quantity * SmithedBar.outputMultiple
		};

		await user.addItemsToBank(loot, true);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		channel.send(str).catch(noOp);

		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					if (response.author.minionIsBusy) return;

					user.log(`continued trip of  ${SmithedBar.name}[${SmithedBar.id}]`);

					this.client.commands
						.get('smithed')!
						.run(response as KlasaMessage, [SmithedBar.name]);
				}
			})
			.catch(noOp);
	}
}
