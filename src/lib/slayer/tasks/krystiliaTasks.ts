import { Monsters } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';
import { AssignableSlayerTask } from '../types';

export const krystiliaTasks: AssignableSlayerTask[] = [
	{
		monster: Monsters.AbyssalDemon,
		amount: [75, 125],
		weight: 5,
		monsters: [Monsters.AbyssalDemon.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.AugmentMyAbbies,
		slayerLevel: 85,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Ankou,
		amount: [75, 125],
		weight: 6,
		monsters: [Monsters.Ankou.id],
		extendedAmount: [91, 150],
		extendedUnlockId: SlayerTaskUnlocksEnum.AnkouVeryMuch,
		unlocked: true,
		wilderness: true
	},
	{
		monster: Monsters.Aviansie,
		amount: [75, 125],
		weight: 7,
		monsters: [Monsters.Aviansie.id],
		extendedAmount: [200, 250],
		extendedUnlockId: SlayerTaskUnlocksEnum.BirdsOfAFeather,
		unlocked: true,
		wilderness: true
	}
];
