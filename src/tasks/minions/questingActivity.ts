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
		let qpRecieved = rand(1, 30);

		const max = user.isIronman ? 100_000 : MAX_QP;

		const newQP = currentQP + qpRecieved;

		// The minion could be at (max - 1) QP, but gain 4 QP here, so we'll trim that down from 4 to 1.
		if (newQP > max) {
			qpRecieved -= newQP - max;
		}

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. Your current QP is ${
			currentQP + qpRecieved
		}.`;

		const hasMaxQP = newQP >= max;
		if (hasMaxQP) {
			str += `\n\nYou have achieved the maximum amount of ${max} Quest Points!`;
		}

		await user.addQP(qpRecieved);
		const herbLevel = user.skillLevel(SkillsEnum.Herblore);
		if (herbLevel === 1 && newQP > 5 && roll(2)) {
			await user.addXP(SkillsEnum.Herblore, 250);
			str += `${Emoji.Herblore} You received 250 Herblore XP for completing Druidic Ritual.`;
		}

		if (roll(350)) {
			str += `\n<:zippy:749240799090180196> While you walk through the forest north of falador, a small ferret jumps onto your back and joins you on your adventures!`;
			user.addItemsToBank({ 10092: 1 }, true);
		}

		const magicXP = user.settings.get(UserSettings.Skills.Magic);
		if (magicXP === 0 && roll(2)) {
			await user.addXP(SkillsEnum.Magic, 325);
			str += `${Emoji.Magic} You received 325 Magic XP for completing Witch's Potion.`;
		} else if (magicXP < 1000 && newQP > 15 && roll(2)) {
			await user.addXP(SkillsEnum.Magic, 1000);
			str += `${Emoji.Magic} You received 1000 Magic XP for completing Fairytale I - Growing Pains.`;
		} else if (
			user.skillLevel(SkillsEnum.Cooking) >= 40 &&
			newQP > 50 &&
			magicXP < 2500 &&
			roll(2)
		) {
			await user.addXP(SkillsEnum.Magic, 2500);
			str += `${Emoji.Magic} You received 2500 Magic XP for completing Recipe For Disaster (Lumbridge guide subquest).`;
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
			undefined,
			data,
			null
		);
	}
}
