import { calcPercentOfNum, calcWhatPercent, randInt } from 'e';

import { KandarinDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

export const barbAssaultTask: MinionTask = {
	type: 'BarbarianAssault',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);
		const { honour_level: currentHonourLevel } = await user.fetchStats({ honour_level: true });

		let basePoints = 35;

		let resultStr = `The base amount of points is 35. Your Honour Level is ${currentHonourLevel}. `;

		const teamSkillPercent = calcWhatPercent(currentHonourLevel, 5);

		basePoints += calcPercentOfNum(teamSkillPercent, 20);

		let pts = basePoints + randInt(-3, 3);

		const [hasDiary] = await userhasDiaryTier(user, KandarinDiary.hard);
		if (hasDiary) {
			pts *= 1.1;
			resultStr += `${user.usernameOrMention} received 10% extra pts for Kandarin Hard diary. `;
		}
		const totalPoints = Math.floor(pts * quantity);

		await incrementMinigameScore(user.id, 'barb_assault', quantity);
		await userStatsUpdate(
			user.id,
			{
				honour_points: {
					increment: totalPoints
				}
			},
			{}
		);

		resultStr = `${user.mention}, ${user.minionName} finished doing ${quantity} waves of Barbarian Assault, you received ${totalPoints} Honour Points.
${resultStr}`;

		handleTripFinish(user, channelID, resultStr, undefined, data, null);
	}
};
