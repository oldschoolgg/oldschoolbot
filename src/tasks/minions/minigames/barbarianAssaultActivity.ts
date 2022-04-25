import { calcPercentOfNum, calcWhatPercent, randInt } from 'e';
import { Task } from 'klasa';

import { client } from '../../..';
import { KandarinDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const [klasaUser, user] = await Promise.all([client.fetchUser(userID), mahojiUsersSettingsFetch(userID)]);
		let basePoints = 35;

		let resultStr = `The base amount of points is 35. Your Honour Level is ${user.honour_level}.`;

		const teamSkillPercent = calcWhatPercent(user.honour_level, 5);

		basePoints += calcPercentOfNum(teamSkillPercent, 20);

		let pts = basePoints + randInt(-3, 3);
		const [hasDiary] = await userhasDiaryTier(klasaUser, KandarinDiary.hard);
		if (hasDiary) {
			pts *= 1.1;
			resultStr += `${klasaUser.username} 10% extra pts for Kandarin Hard diary. `;
		}
		let totalPoints = Math.floor(pts * quantity);

		await incrementMinigameScore(user.id, 'barb_assault', quantity);
		await mahojiUserSettingsUpdate(client, user.id, {
			honour_points: {
				increment: totalPoints
			}
		});

		resultStr = `${klasaUser}, ${klasaUser.minionName} finished doing ${quantity} waves of Barbarian Assault, you received ${totalPoints} Honour Points.
${resultStr}`;

		handleTripFinish(
			this.client,
			klasaUser,
			channelID,
			resultStr,
			['minigames', { barb_assault: { start: {} } }, true, 'play'],
			undefined,
			data,
			null
		);
	}
}
