import { calcPercentOfNum, calcWhatPercent } from '@oldschoolgg/toolkit';

import { DiaryID } from '@/lib/minions/types.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const barbAssaultTask: MinionTask = {
	type: 'BarbarianAssault',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelID, quantity } = data;

		const { honour_level: currentHonourLevel } = await user.fetchStats();

		let basePoints = 35;

		let resultStr = `The base amount of points is 35. Your Honour Level is ${currentHonourLevel}. `;

		const teamSkillPercent = calcWhatPercent(currentHonourLevel, 5);

		basePoints += calcPercentOfNum(teamSkillPercent, 20);

		let pts = basePoints + rng.randInt(-3, 3);

		const [hasDiary] = await user.hasDiaryTier(DiaryID.Kandarin, 'hard');
		if (hasDiary) {
			pts *= 1.1;
			resultStr += `${user.usernameOrMention} received 10% extra pts for Kandarin Hard diary. `;
		}
		const totalPoints = Math.floor(pts * quantity);

		await user.incrementMinigameScore('barb_assault', quantity);
		await user.statsUpdate({
			honour_points: {
				increment: totalPoints
			}
		});

		resultStr = `${user.mention}, ${user.minionName} finished doing ${quantity} waves of Barbarian Assault, you received ${totalPoints} Honour Points.
${resultStr}`;

		handleTripFinish(user, channelID, resultStr, undefined, data, null);
	}
};
