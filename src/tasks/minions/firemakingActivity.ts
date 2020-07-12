import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../lib/skilling/types';

export default class extends Task {
	async run({
		burnableID,
		quantity,
		userID,
		channelID,
		duration
	}: FiremakingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);

		const Burn = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID);

		if (!Burn) return;

		const xpReceived = quantity * Burn.xp;

		await user.addXP(SkillsEnum.Firemaking, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		let str = `${user}, ${user.minionName} finished lighting ${quantity} ${
			Burn.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
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
						user.log(`continued trip of ${quantity}x ${Burn.name}[${Burn.inputLogs}]`);
						this.client.commands
							.get('light')!
							.run(response as KlasaMessage, [quantity, Burn.name]);
					}
				})
				.catch(noOp);
		});
	}
}
