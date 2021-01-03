import { KlasaMessage, Task } from 'klasa';

import { Emoji, MAX_QP } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { rand, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: QuestingActivityTaskOptions) {
		const { userID, channelID, duration } = data;
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
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. Your current QP is ${
			currentQP + qpRecieved
		}.`;

		const hasMaxQP = currentQP + qpRecieved >= MAX_QP;
		if (hasMaxQP) {
			str += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		}

		await user.addQP(qpRecieved);
		const herbLevel = user.skillLevel(SkillsEnum.Herblore);
		if (herbLevel === 0 && currentQP + qpRecieved > 5 && roll(2)) {
			await user.addXP(SkillsEnum.Herblore, 250);
			str += `${Emoji.Herblore} You received 250 Herblore XP for completing Druidic Ritual.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			hasMaxQP
				? undefined
				: res => {
						user.log(`continued trip of Questing.`);
						return this.client.commands.get('quest')!.run(res as KlasaMessage, []);
				  },
			data
		);
	}
}
