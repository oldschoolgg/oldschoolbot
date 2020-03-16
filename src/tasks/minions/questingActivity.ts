import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { UserSettings } from '../../lib/UserSettings';

export default class extends Task {
	async run({ userID, channelID }: QuestingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentQP = user.settings.get(UserSettings.QP);

		// Give them a random amount of QP within (4,7)
		const qpRecieved = Math.floor(Math.random() * 4) + 3;

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (currentQP + qpRecieved >= 275) {
			str += `You have achieved the maximum amount of 275 Quest Points!`;
		}

		// Add QP and make sure they don't have over the max of 275
		await user.addQP(qpRecieved);
		if (user.settings.get(UserSettings.QP) > 275) {
			user.settings.update('QP', 275);
		}

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

					user.log(`continued trip of Questing.`);

					this.client.commands.get('goquest')!.run(response as KlasaMessage, []);
				}
			})
			.catch(noOp);
	}
}
