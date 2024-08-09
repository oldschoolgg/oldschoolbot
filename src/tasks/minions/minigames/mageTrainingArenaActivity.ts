import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const pizazzPointsPerHour = 100;

export const mageTrainingTask: MinionTask = {
	type: 'MageTrainingArena',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, duration, userID } = data;

		await incrementMinigameScore(userID, 'magic_training_arena', quantity);

		const loot = new Bank();

		const user = await mUserFetch(userID);
		const baseXP = (25_000 / (Time.Minute * 60)) * duration;
		const xp = randomVariation(baseXP, 5);
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
		const totalPizazzPoints = await prisma.newUser.findUnique({
			where: { id: userID },
			select: {
				pizazz_points: true
			}
		});

		const str = `${user}, ${
			user.minionName
		} finished completing ${quantity}x Magic Training Arena rooms. You received **${pizazzPoints} Pizazz points**. You now have **${totalPizazzPoints?.pizazz_points.toLocaleString()} Pizazz points**. ${xpRes}`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
