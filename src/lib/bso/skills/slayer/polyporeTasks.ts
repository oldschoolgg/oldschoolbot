import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';

import type { AssignableSlayerTask } from '@/lib/slayer/types.js';

export const polyporeTasks: AssignableSlayerTask[] = [
	{
		monster: BSOMonsters.FungalRodent,
		amount: [60, 120],
		weight: 6,
		monsters: [BSOMonsters.FungalRodent.id],
		slayerLevel: BSOMonsters.FungalRodent.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: BSOMonsters.InfestedAxe,
		amount: [60, 120],
		weight: 6,
		monsters: [BSOMonsters.InfestedAxe.id],
		slayerLevel: BSOMonsters.InfestedAxe.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: BSOMonsters.Grifolaroo,
		amount: [60, 100],
		weight: 6,
		monsters: [BSOMonsters.Grifolaroo.id],
		slayerLevel: BSOMonsters.Grifolaroo.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: BSOMonsters.Grifolapine,
		amount: [60, 80],
		weight: 6,
		monsters: [BSOMonsters.Grifolapine.id],
		slayerLevel: BSOMonsters.Grifolapine.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: BSOMonsters.GanodermicRunt,
		amount: [30, 55],
		weight: 6,
		monsters: [BSOMonsters.GanodermicRunt.id],
		slayerLevel: BSOMonsters.GanodermicRunt.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: BSOMonsters.GanodermicBeast,
		amount: [20, 49],
		weight: 6,
		monsters: [BSOMonsters.GanodermicBeast.id],
		slayerLevel: BSOMonsters.GanodermicBeast.levelRequirements?.slayer ?? 20,
		unlocked: false
	}
];
