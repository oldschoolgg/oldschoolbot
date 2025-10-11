import { Time } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { getBoatType } from '@/mahoji/lib/abstracted_commands/pestControlCommand.js';

export const pestControlTask: MinionTask = {
	type: 'PestControl',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;

		const { boatType, pointsPerGame, bonusPointsPerGame } = getBoatType(user, user.combatLevel);

		let points = pointsPerGame * quantity;
		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}
		await user.incrementMinigameScore('pest_control', quantity);
		const newUserStats = await user.statsUpdate({
			pest_control_points: {
				increment: points
			}
		});

		const perHour = `(${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${user.minionName} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${newUserStats.pest_control_points} points. ${perHour}`;
		if (flappyRes.shouldGiveBoost) str += `\n${flappyRes.userMsg}`;

		if (bonusPointsPerGame > 0) {
			str += `\n\n**Bonus points:** ${bonusPointsPerGame} per game`;
		}
		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
