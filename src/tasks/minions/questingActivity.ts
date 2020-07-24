import { KlasaMessage, Task } from 'klasa';

import { noOp, rand, saidYes } from '../../lib/util';
import { MAX_QP, Time } from '../../lib/constants';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Task {
	async run({ userID, channelID, duration }: QuestingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentQP = user.settings.get(UserSettings.QP);

		// This assumes you do quests in order of scaling difficulty, ~115 hours for max qp
		let qpRecieved = rand(1, 3);
		if (currentQP >= 200) {
			qpRecieved = 1;
		} else if (currentQP >= 100) {
			qpRecieved = rand(1, 2);
		}

		// The minion could be at (MAX_QP - 1) QP, but gain 4 QP here, so we'll trim that down from 4 to 1.
		if (currentQP + qpRecieved > MAX_QP) {
			qpRecieved -= currentQP + qpRecieved - MAX_QP;
		}

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. Your current QP is ${currentQP +
			qpRecieved}.`;

		if (currentQP + qpRecieved >= MAX_QP) {
			str += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		} else {
			str += ` ${user.minionName} asks if you'd like them to do another of the same trip.`;
		}

		await user.addQP(qpRecieved);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str).catch(noOp);
			if (currentQP + qpRecieved >= MAX_QP) return;
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

						this.client.commands.get('quest')!.run(response as KlasaMessage, []);
					}
				})
				.catch(noOp);
		});
	}
}
