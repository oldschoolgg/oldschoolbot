import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const pizazzPointsPerHour = 100;

export const mageTrainingTask: MinionTask = {
	type: 'MageTrainingArena',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration } = data;

		await user.incrementMinigameScore('magic_training_arena', quantity);

		const loot = new Bank();

		const baseXP = (25_000 / (Time.Minute * 60)) * duration;
		const xp = rng.randomVariation(baseXP, 5);
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xp,
			duration
		});
		const pizazzPoints = Math.floor((pizazzPointsPerHour / (Time.Minute * 60)) * duration);
		await prisma.newUser.update({
			where: { id: user.id },
			data: {
				pizazz_points: {
					increment: pizazzPoints
				}
			}
		});
		const totalPizazzPoints = await prisma.newUser.findUnique({
			where: { id: user.id },
			select: {
				pizazz_points: true
			}
		});

		const str = `${user}, ${
			user.minionName
		} finished completing ${quantity}x Magic Training Arena rooms. You received **${pizazzPoints} Pizazz points**. You now have **${totalPizazzPoints?.pizazz_points.toLocaleString()} Pizazz points**. ${xpRes}`;

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
