import { BSOMonsters } from '../../minions/data/killableMonsters/custom/customMonsters';
import { getMonster } from '../../util';
import { AssignableSlayerTask } from '../types';
import { SlayerTaskUnlocksEnum } from '../slayerUnlocks';

export const resourceDungeonTasks: AssignableSlayerTask[] = [
    {
        monster: getMonster('Drakon'),
        amount: [10, 30],
        weight: 8,
        monsters: [BSOMonsters.Drakon.id],
        slayerLevel: BSOMonsters.Drakon.levelRequirements?.slayer ?? 20,
        extendedAmount: [20, 50],
        extendedUnlockId: SlayerTaskUnlocksEnum.DrakonThingsOut,
        unlocked: false
    },
    {
        monster: getMonster('Frost Dragon'),
        amount: [100, 200],
        weight: 6,
        monsters: [BSOMonsters.FrostDragon.id],
        slayerLevel: BSOMonsters.FrostDragon.levelRequirements?.slayer ?? 20,
        extendedAmount: [150, 250],
        extendedUnlockId: SlayerTaskUnlocksEnum.StayingFrosty,
        unlocked: false
    },
    {
        monster: getMonster('Rum-pumped crab'),
        amount: [100, 200],
        weight: 4,
        monsters: [BSOMonsters.RumPumpedCrab.id],
        slayerLevel: BSOMonsters.RumPumpedCrab.levelRequirements?.slayer ?? 20,
        unlocked: false
    }
];
