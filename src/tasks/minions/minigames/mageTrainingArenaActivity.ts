import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { prisma } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinionTask } from '../../../lib/Task';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mUserFetch } from '../../../mahoji/mahojiSettings';

export const pizazzPointsPerHour = 100;

export const mageTrainingTask: MinionTask = {
	type: 'MageTrainingArena',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		await incrementMinigameScore(userID, 'magic_training_arena', quantity);

		const loot = new Bank();

		const user = await mUserFetch(userID);
		let baseXP = (25_000 / (Time.Minute * 60)) * duration;
		let xp = randomVariation(baseXP, 5);
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xp,
			duration
		});
		const pizazzPoints = Math.floor((pizazzPointsPerHour / (Time.Minute * 60)) * duration);
		await prisma.newUser.update({
			where: { id: userID },
			data: {
				pizazz_points: {
					increment: pizazzPoints
				}
			}
		});

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Magic Training Arena rooms. You received **${pizazzPoints} Pizazz points**. ${xpRes}`;

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { mage_training_arena: { start: {} } }, true],
			undefined,
			data,
			loot
		);
	}
};
