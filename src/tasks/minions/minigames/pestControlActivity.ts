import { Time } from 'e';
import { toKMB } from 'oldschooljs/dist/util';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { getBoatType } from '../../../mahoji/lib/abstracted_commands/pestControlCommand';

export const pestControlTask: MinionTask = {
	type: 'PestControl',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const [boatType, pointsPerGame] = getBoatType(user.combatLevel);

		let points = pointsPerGame * quantity;
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}
		await incrementMinigameScore(userID, 'pest_control', quantity);
		const { newUser } = await user.update({
			pest_control_points: {
				increment: points
			}
		});

		let perHour = `(${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${user.minionName} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${newUser.pest_control_points} points. ${perHour}`;
		if (flappyRes.shouldGiveBoost) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { pest_control: { start: {} } }, true, 'start'],
			undefined,
			data,
			null
		);
	}
};
