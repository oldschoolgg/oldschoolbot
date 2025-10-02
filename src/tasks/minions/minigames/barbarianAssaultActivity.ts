import { userHasFlappy } from '@/lib/bso/skills/invention/inventions.js';

import { randInt } from '@oldschoolgg/rng';
import { calcPercentOfNum, calcWhatPercent } from '@oldschoolgg/toolkit';

import { KandarinDiary, userhasDiaryTier } from '@/lib/diaries.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const barbAssaultTask: MinionTask = {
	type: 'BarbarianAssault',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;
		const { honour_level: currentHonourLevel } = await user.fetchStats();

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
		let totalPoints = Math.floor(pts * quantity);

		const flappyRes = await userHasFlappy({ user, duration });

		if (flappyRes.shouldGiveBoost) {
			totalPoints *= 2;
		}

		await user.incrementMinigameScore('barb_assault', quantity);
		await user.statsUpdate({
			honour_points: {
				increment: totalPoints
			}
		});

		resultStr = `${user.mention}, ${user.minionName} finished doing ${quantity} waves of Barbarian Assault, you received ${totalPoints} Honour Points.
${resultStr}`;
		if (flappyRes.shouldGiveBoost) resultStr += `\n\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, resultStr, undefined, data, null);
	}
};
