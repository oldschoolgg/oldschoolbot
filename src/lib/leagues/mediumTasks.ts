import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import { cluesBeginnerCL, cluesEasyCL, cluesMediumCL, cyclopsCL } from '../data/CollectionsExport';
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

export const mediumTasks: TaskWithoutID[] = [
	{
		name: 'Complete the Medium Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.medium))[0];
		}
	},
	{
		name: 'Complete the Medium Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.medium))[0];
		}
	},
	{
		name: 'Defeat a greater demon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.GreaterDemon.id] ?? 0) >= 1;
		}
	},
	{
		name: 'Smith 100 Iron bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Iron ore') >= 100 && cl.amount('Iron bar') >= 100;
		}
	},
	{
		name: 'Build a pool in your PoH',
		has: async ({ poh }) => {
			return poh.pool !== null;
		}
	},
	{
		name: 'Build a throne in your PoH',
		has: async ({ poh }) => {
			return poh.throne !== null;
		}
	},
	{
		name: 'Build a jewellery box in your PoH',
		has: async ({ poh }) => {
			return poh.jewellery_box !== null;
		}
	},
	{
		name: 'Build a prayer altar in your PoH',
		has: async ({ poh }) => {
			return poh.prayer_altar !== null;
		}
	},
	{
		name: 'Build a spellbook altar in your PoH',
		has: async ({ poh }) => {
			return poh.spellbook_altar !== null;
		}
	},
	{
		name: 'Complete 50 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 50;
		}
	},
	{
		name: 'Do 50 laps at the Varrock Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[4] ?? 0) >= 50;
		}
	},
	{
		name: 'Obtain 100 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 100;
		}
	},
	{
		name: 'Reach combat level 70',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 70;
		}
	},
	{
		name: 'Reach total level 600',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 600;
		}
	},
	{
		name: 'Defeat Tempoross 50 times',
		has: async ({ minigames }) => {
			return minigames.tempoross >= 50;
		}
	},
	{
		name: 'Complete 20 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 20;
		}
	},
	{
		name: 'Receive the full Angler outfit',
		has: async ({ cl }) => {
			return resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']).every(i => cl.has(i));
		}
	},
	{
		name: 'Defeat Wintertodt 50 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 50;
		}
	},
	{
		name: 'Complete 10 Castle Wars games',
		has: async ({ minigames }) => {
			return minigames.castle_wars >= 10;
		}
	},
	{
		name: 'Catch 200 Orange salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Orange salamander', 200);
		}
	},
	{
		name: 'Mix 100 Restore potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Restore potion (3)', 'Restore potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Mix 100 Energy potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Energy potion (3)', 'Energy potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Mix 500 Prayer potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => cl.amount(i))) >= 500;
		}
	},
	{
		name: 'Obtain 5 unique items from Medium caskets',
		has: async ({ cl }) => {
			return cluesMediumCL.filter(i => cl.has(i)).length >= 5;
		}
	},
	{
		name: 'Finish the beginner clue CL',
		has: async ({ cl }) => {
			return cluesBeginnerCL.filter(i => cl.has(i)).length === cluesBeginnerCL.length;
		}
	},
	{
		name: 'Finish the easy clue CL',
		has: async ({ cl }) => {
			return cluesEasyCL.filter(i => cl.has(i)).length === cluesEasyCL.length;
		}
	},
	{
		name: 'Finish the easy clue CL',
		has: async ({ cl }) => {
			return cluesEasyCL.filter(i => cl.has(i)).length === cluesEasyCL.length;
		}
	},
	{
		name: 'Receive every defender',
		has: async ({ cl }) => {
			return cyclopsCL.every(i => cl.has(i));
		}
	}
];
