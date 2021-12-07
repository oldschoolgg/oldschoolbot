import { BSOMonsters } from '../../minions/data/killableMonsters/custom/customMonsters';
import { getMonster } from '../../util';
import { AssignableSlayerTask } from '../types';

export const polyporeTasks: AssignableSlayerTask[] = [
	{
		monster: getMonster('Fungal Rodent'),
		amount: [60, 120],
		weight: 6,
		monsters: [BSOMonsters.FungalRodent.id],
		slayerLevel: BSOMonsters.FungalRodent.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: getMonster('Infested axe'),
		amount: [60, 120],
		weight: 6,
		monsters: [BSOMonsters.InfestedAxe.id],
		slayerLevel: BSOMonsters.InfestedAxe.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: getMonster('Grifolaroo'),
		amount: [60, 100],
		weight: 6,
		monsters: [BSOMonsters.Grifolaroo.id],
		slayerLevel: BSOMonsters.Grifolaroo.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: getMonster('Grifolapine'),
		amount: [60, 80],
		weight: 6,
		monsters: [BSOMonsters.Grifolapine.id],
		slayerLevel: BSOMonsters.Grifolapine.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: getMonster('Ganodermic Runt'),
		amount: [30, 55],
		weight: 6,
		monsters: [BSOMonsters.GanodermicRunt.id],
		slayerLevel: BSOMonsters.GanodermicRunt.levelRequirements?.slayer ?? 20,
		unlocked: false
	},
	{
		monster: getMonster('Ganodermic Beast'),
		amount: [20, 49],
		weight: 6,
		monsters: [BSOMonsters.GanodermicBeast.id],
		slayerLevel: BSOMonsters.GanodermicBeast.levelRequirements?.slayer ?? 20,
		unlocked: false
	}
];
