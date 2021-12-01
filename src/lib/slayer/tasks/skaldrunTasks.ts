import { BSOMonsters } from '../../minions/data/killableMonsters/custom/customMonsters';
import { getMonster } from '../../util';
import { AssignableSlayerTask } from '../types';

export const skaldrunTasks: AssignableSlayerTask[] = [
	{
		monster: getMonster('Frost Dragon'),
		amount: [8, 84],
		weight: 6,
		monsters: [BSOMonsters.FrostDragon.id],
		combatLevel: 6,
		slayerLevel: 60,
		questPoints: 1,
		unlocked: true,
		dungeoneeringLevel: BSOMonsters.FrostDragon.levelRequirements?.dungeoneering
	}
];
