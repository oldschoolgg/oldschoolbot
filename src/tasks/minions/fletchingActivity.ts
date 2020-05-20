import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import Fletching from '../../lib/skilling/skills/fletching/fletching';

export default class extends Task {
	async run({ fletchableID, quantity, userID, channelID }: FletchingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fletching);

		const Fletchable = Fletching.Fletchables.find(fletchable => fletchable.id === fletchableID);

		if (!Fletchable) return;

		const xpReceived = quantity * Fletchable.xp;
		let newQuantity = quantity;
		if (!Fletchable.outputMultiple) {
			newQuantity = quantity;
		} else {
			newQuantity = quantity * Fletchable.outputMultiple;
		}

		await user.addXP(SkillsEnum.Fletching, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Fletching);

		let str = `${user}, ${user.minionName} finished fletching ${newQuantity} ${
			Fletchable.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Fletching level is now ${newLevel}!`;
		}

		const loot = {
			[Fletchable.id]: newQuantity
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
							`continued trip of ${quantity}x ${Fletchable.name}[${Fletchable.id}]`
						);
						this.client.commands
							.get('fletch')!
							.run(response as KlasaMessage, [quantity, Fletchable.name]);
					}
				})
				.catch(noOp);
		});
	}
}
