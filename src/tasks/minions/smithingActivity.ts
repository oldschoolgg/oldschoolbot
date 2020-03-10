import { Task, KlasaMessage } from 'klasa';
import { TextChannel, DMChannel } from 'discord.js';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Smithing from '../../lib/skills/smithing';

export default class extends Task {
	async run({ barID, quantity, userID, channelID }: SmithingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const bar = Smithing.Bars.find(bar => bar.id === barID);
		if (!bar) return;

		const xpReceived = quantity * bar.xp;

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smithing ${quantity}x ${
			bar.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		const loot = {
			[bar.id]: quantity
		};

		await user.addItemsToBank(loot, true);

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str);

		user.toggleBusy(true);
		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					user.log(`continued trip of ${quantity}x ${bar.name}[${bar.id}]`);

					this.client.commands
						.get('smith')!
						.run(response as KlasaMessage, [quantity, bar.name]);
				}
			})
			.catch(noOp)
			.finally(() => user.toggleBusy(false));
	}
}
