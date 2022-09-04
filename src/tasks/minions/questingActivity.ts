import { MinionTask } from '../../../lib/Task';

import { Emoji, MAX_QP } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { rand, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { mUserFetch } from '../../mahoji/mahojiSettings';

export const TODO.Task: MinionTask = {
type: '',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);
		const currentQP = user.QP;

		// This assumes you do quests in order of scaling difficulty, ~115 hours for max qp
		let qpRecieved = rand(1, 3);
		if (currentQP >= 200) {
			qpRecieved = 1;
		} else if (currentQP >= 100) {
			qpRecieved = rand(1, 2);
		}

		const newQP = currentQP + qpRecieved;

		// The minion could be at (MAX_QP - 1) QP, but gain 4 QP here, so we'll trim that down from 4 to 1.
		if (newQP > MAX_QP) {
			qpRecieved -= newQP - MAX_QP;
		}

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpRecieved.toLocaleString()} QP. Your current QP is ${
			currentQP + qpRecieved
		}.`;

		const hasMaxQP = newQP >= MAX_QP;
		if (hasMaxQP) {
			str += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		}

		await user.update({
			QP: {
				increment: qpRecieved
			}
		});
		const herbLevel = user.skillLevel(SkillsEnum.Herblore);
		if (herbLevel === 1 && newQP > 5 && roll(2)) {
			await user.addXP({ skillName: SkillsEnum.Herblore, amount: 250 });
			str += `${Emoji.Herblore} You received 250 Herblore XP for completing Druidic Ritual.`;
		}

		const magicXP = Number(user.user.skills_magic);
		if (magicXP === 0 && roll(2)) {
			await user.addXP({ skillName: SkillsEnum.Magic, amount: 325 });
			str += `${Emoji.Magic} You received 325 Magic XP for completing Witch's Potion.`;
		} else if (magicXP < 1000 && newQP > 15 && roll(2)) {
			await user.addXP({ skillName: SkillsEnum.Magic, amount: 1000 });
			str += `${Emoji.Magic} You received 1000 Magic XP for completing Fairytale I - Growing Pains.`;
		} else if (user.skillLevel(SkillsEnum.Cooking) >= 40 && newQP > 50 && magicXP < 2500 && roll(2)) {
			await user.addXP({ skillName: SkillsEnum.Magic, amount: 2500 });
			str += `${Emoji.Magic} You received 2500 Magic XP for completing Recipe For Disaster (Lumbridge guide subquest).`;
		}

		handleTripFinish(
			user,
			channelID,
			str,
			hasMaxQP ? undefined : ['activities', { quest: {} }, true],
			undefined,
			data,
			null
		);
	}
}
