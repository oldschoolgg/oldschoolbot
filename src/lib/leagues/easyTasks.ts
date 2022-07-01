import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import { cluesBeginnerCL, cluesEasyCL, customPetsCL } from '../data/CollectionsExport';
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
import { leaguesHasCatches, leaguesHasKC, Task } from './leagues';

export const easyTasks: Task[] = [
	{
		id: 1,
		name: 'Smith 100 Bronze bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Copper ore') >= 100 && cl.amount('Tin ore') >= 100 && cl.amount('Bronze bar') >= 100;
		}
	},
	{
		id: 2,
		name: 'Do 50 laps at the Gnome Stronghold Agility Course',
		has: async ({ lapScores }) => {
			return (lapScores[1] ?? 0) >= 50;
		}
	},
	{
		id: 3,
		name: 'Obtain 10 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 10;
		}
	},
	{
		id: 4,
		name: 'Cut 5 Sapphires',
		has: async ({ cl }) => {
			return cl.amount('Sapphire') >= 5;
		}
	},
	{
		id: 5,
		name: 'Chop 50 Oak logs',
		has: async ({ cl }) => {
			return cl.amount('Oak logs') >= 50;
		}
	},
	{
		id: 6,
		name: "Make 5 Willow shield's",
		has: async ({ cl }) => {
			return cl.amount('Willow shield') >= 5;
		}
	},
	{
		id: 7,
		name: 'Complete the Easy Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.easy))[0];
		}
	},
	{
		id: 8,
		name: 'Complete the Easy Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.easy))[0];
		}
	},
	{
		id: 9,
		name: 'Complete the Easy Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.easy))[0];
		}
	},
	{
		id: 10,
		name: 'Complete the Easy Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.easy))[0];
		}
	},
	{
		id: 11,
		name: 'Complete the Easy Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.easy))[0];
		}
	},
	{
		id: 12,
		name: 'Complete the Easy Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.easy))[0];
		}
	},
	{
		id: 13,
		name: 'Complete the Easy Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.easy))[0];
		}
	},
	{
		id: 14,
		name: 'Complete the Easy Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.easy))[0];
		}
	},
	{
		id: 15,
		name: 'Complete the Easy Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.easy))[0];
		}
	},
	{
		id: 16,
		name: 'Complete the Easy Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.easy))[0];
		}
	},
	{
		id: 17,
		name: 'Complete the Easy Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.easy))[0];
		}
	},
	{
		id: 18,
		name: 'Complete the Easy Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.easy))[0];
		}
	},
	{
		id: 19,
		name: 'Do a Tears of Guthix Trip',
		has: async ({ activityCounts }) => {
			return (activityCounts.TearsOfGuthix ?? 0) >= 1;
		}
	},
	{
		id: 20,
		name: 'Do 5 Pest Control Trips',
		has: async ({ activityCounts }) => {
			return (activityCounts.PestControl ?? 0) >= 1;
		}
	},
	{
		id: 21,
		name: 'Reach combat level 50',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 30;
		}
	},
	{
		id: 22,
		name: 'Reach total level 300',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 300;
		}
	},
	{
		id: 23,
		name: 'Obtain 3 unique items from Beginner caskets',
		has: async ({ cl }) => {
			return cluesBeginnerCL.filter(i => cl.has(i)).length >= 3;
		}
	},
	{
		id: 24,
		name: 'Obtain 3 unique items from Easy caskets',
		has: async ({ cl }) => {
			return cluesEasyCL.filter(i => cl.has(i)).length >= 3;
		}
	},
	{
		id: 25,
		name: 'Defeat a lesser demon',
		has: async args => {
			return leaguesHasKC(args, Monsters.LesserDemon);
		}
	},
	{
		id: 26,
		name: 'Catch a Crimson swift',
		has: async args => {
			return leaguesHasCatches(args, 'Crimson swift');
		}
	},
	{
		id: 27,
		name: 'Catch a Swamp lizard',
		has: async args => {
			return leaguesHasCatches(args, 'Swamp lizard');
		}
	},
	{
		id: 28,
		name: 'Complete a slayer task',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 1;
		}
	},
	{
		id: 29,
		name: 'Offer any bones.',
		has: async ({ activityCounts }) => {
			return (activityCounts.Offering ?? 0) >= 1;
		}
	},
	{
		id: 30,
		name: 'Complete a Fishing Trawler trip.',
		has: async ({ activityCounts }) => {
			return (activityCounts.FishingTrawler ?? 0) >= 1;
		}
	},
	{
		id: 31,
		name: 'Mix 100 Attack potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Attack potion(3)', 'Attack potion(4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 32,
		name: 'Mix 100 Antipoison potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Antipoison (3)', 'Antipoison (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 33,
		name: 'Mix 100 Strength potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Strength potion (3)', 'Strength potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 34,
		name: 'Receive any custom pet',
		has: async ({ cl }) => {
			return customPetsCL.filter(i => cl.has(i)).length >= 1;
		}
	},
	{
		id: 35,
		name: 'Open a TMB',
		has: async ({ opens }) => {
			return opens.has('Tradeable mystery box');
		}
	},
	{
		id: 36,
		name: 'Open a UMB',
		has: async ({ opens }) => {
			return opens.has('Untradeable mystery box');
		}
	},
	{
		id: 37,
		name: 'Open a EMB',
		has: async ({ opens }) => {
			return opens.has('Equippable mystery box');
		}
	},
	{
		id: 38,
		name: 'Open a CMB',
		has: async ({ opens }) => {
			return opens.has('Clothing mystery box');
		}
	},
	{
		id: 39,
		name: 'Open a HMB',
		has: async ({ opens }) => {
			return opens.has('Holiday mystery box');
		}
	},
	{
		id: 40,
		name: 'Open a PMB',
		has: async ({ opens }) => {
			return opens.has('Pet mystery box');
		}
	}
];
