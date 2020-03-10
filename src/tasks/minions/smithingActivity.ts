import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Smithing from '../../lib/skills/smithing';
import { rand } from 'oldschooljs/dist/util/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';

export default class extends Task {
	async run({ barID, quantity, userID, channelID }: SmithingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const bar = Smithing.Bars.find(bar => bar.id === barID);
		if (!bar) return;

		// If this bar has a chance of failing to smith, calculate that here.
		const oldQuantity = quantity;
		if (bar.chanceOfFail > 0) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (rand(0, 100) < bar.chanceOfFail) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

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

		if (bar.chanceOfFail > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${bar.name}s failed to smelt.`;
		}

		const loot = {
			[bar.id]: quantity
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

					user.log(`continued trip of ${oldQuantity}x ${bar.name}[${bar.id}]`);

					this.client.commands
						.get('smith')!
						.run(response as KlasaMessage, [oldQuantity, bar.name]);
				}
			})
			.catch(noOp);
	}
}
