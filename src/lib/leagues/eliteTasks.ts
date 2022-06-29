import { sumArr } from 'e';

import { all3rdAgeItems, cluesHardCL } from '../data/CollectionsExport';
import {
	ArdougneDiary,
	DesertDiary,
	FaladorDiary,
	FremennikDiary,
	KandarinDiary,
	KaramjaDiary,
	KourendKebosDiary,
	LumbridgeDraynorDiary,
	MorytaniaDiary,
	userhasDiaryTier,
	VarrockDiary,
	WesternProv,
	WildernessDiary
} from '../diaries';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, TaskWithoutID } from './leagues';

export const eliteTasks: TaskWithoutID[] = [
	{
		name: 'Complete the Elite Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.elite))[0];
		}
	},
	{
		name: 'Complete the Elite Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.elite))[0];
		}
	},
	{
		name: 'Smith 100 Adamantite bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Adamantite ore') >= 100 && cl.amount('Adamant bar') >= 100;
		}
	},
	{
		name: 'Complete 250 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 250;
		}
	},
	{
		name: 'Do 50 laps at the Pollnivneach Course',
		has: async ({ lapScores }) => {
			return (lapScores[9] ?? 0) >= 50;
		}
	},
	{
		name: 'Obtain 1000 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 1000;
		}
	},
	{
		name: 'Reach combat level 110',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 110;
		}
	},
	{
		name: 'Reach total level 2000',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2000;
		}
	},
	{
		name: 'Complete 300 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 300;
		}
	},
	{
		name: 'Defeat Wintertodt 1000 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 1000;
		}
	},
	{
		name: 'Catch 200 Black salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Red salamander', 200);
		}
	},
	{
		name: 'Mix 500 Super attack potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super attack potion (3)', 'Super attack potion (4)']).map(i => cl.amount(i))) >=
				500
			);
		}
	},
	{
		name: 'Mix 500 Super strength potions.',
		has: async ({ cl }) => {
			return (
				sumArr(
					resolveItems(['Super strength potion (3)', 'Super strength potion (4)']).map(i => cl.amount(i))
				) >= 500
			);
		}
	},
	{
		name: 'Mix 500 Super defence potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super defence potion (3)', 'Super defence potion (4)']).map(i => cl.amount(i))) >=
				500
			);
		}
	},
	{
		name: 'Mix 500 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 500;
		}
	},
	{
		name: 'Mix 2000 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 2000;
		}
	},
	{
		name: 'Finish the hard clue CL',
		has: async ({ cl }) => {
			return cluesHardCL.filter(i => cl.has(i)).length === cluesHardCL.length;
		}
	},
	{
		name: 'Receive 3 3rd age items',
		has: async ({ cl }) => {
			return all3rdAgeItems.filter(i => cl.has(i)).length >= 3;
		}
	}
];
