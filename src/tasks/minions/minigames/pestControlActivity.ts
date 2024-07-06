import { Time } from 'e';
import { toKMB } from 'oldschooljs/dist/util';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { getBoatType } from '../../../mahoji/lib/abstracted_commands/pestControlCommand';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

export const pestControlTask: MinionTask = {
	type: 'PestControl',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const { boatType, pointsPerGame, bonusPointsPerGame } = getBoatType(user, user.combatLevel);

<<<<<<< HEAD
		let points = pointsPerGame * quantity;
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}
=======
		const points = pointsPerGame * quantity;

>>>>>>> master
		await incrementMinigameScore(userID, 'pest_control', quantity);
		const newUserStats = await userStatsUpdate(
			user.id,
			{
				pest_control_points: {
					increment: points
				}
			},
			{ pest_control_points: true }
		);

		const perHour = `(${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${user.minionName} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${newUserStats.pest_control_points} points. ${perHour}`;
		if (flappyRes.shouldGiveBoost) str += `\n${flappyRes.userMsg}`;

		if (bonusPointsPerGame > 0) {
			str += `\n\n**Bonus points:** ${bonusPointsPerGame} per game`;
		}
		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
