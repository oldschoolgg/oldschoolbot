import { Time } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { getBoatType } from '@/mahoji/lib/abstracted_commands/pestControlCommand.js';

export const pestControlTask: MinionTask = {
	type: 'PestControl',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;

		const { boatType, pointsPerGame, bonusPointsPerGame } = getBoatType(user, user.combatLevel);

		const points = pointsPerGame * quantity;

		await user.incrementMinigameScore('pest_control', quantity);
		await user.statsUpdate({
			pest_control_points: {
				increment: points
			}
		});
		const newPointsBalance = await user.fetchUserStat('pest_control_points');

		const perHour = `(${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${user.minionName} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${newPointsBalance.toLocaleString()} points. ${perHour}`;

		if (bonusPointsPerGame > 0) {
			str += `\n\n**Bonus points:** ${bonusPointsPerGame} per game`;
		}
		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
