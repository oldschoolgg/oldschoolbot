import { calcPercentOfNum, calcWhatPercent, randInt } from 'e';
import { Task } from 'klasa';

import { KandarinDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mahojiUserSettingsUpdate, mUserFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);
		let basePoints = 35;

		let resultStr = `The base amount of points is 35. Your Honour Level is ${user.user.honour_level}. `;

		const teamSkillPercent = calcWhatPercent(user.user.honour_level, 5);

		basePoints += calcPercentOfNum(teamSkillPercent, 20);

		let pts = basePoints + randInt(-3, 3);

		const [hasDiary] = await userhasDiaryTier(user.user, KandarinDiary.hard);
		if (hasDiary) {
			pts *= 1.1;
			resultStr += `${user.usernameOrMention} received 10% extra pts for Kandarin Hard diary. `;
		}
		let totalPoints = Math.floor(pts * quantity);

		await incrementMinigameScore(user.id, 'barb_assault', quantity);
		await mahojiUserSettingsUpdate(user.id, {
			honour_points: {
				increment: totalPoints
			}
		});

		resultStr = `${user.mention}, ${user.minionName} finished doing ${quantity} waves of Barbarian Assault, you received ${totalPoints} Honour Points.
${resultStr}`;

		handleTripFinish(
			user,
			channelID,
			resultStr,
			['minigames', { barb_assault: { start: {} } }, true, 'play'],
			undefined,
			data,
			null
		);
	}
}
