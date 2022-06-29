import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import { allGildedItems, monkeyBackpacksCL } from '../data/CollectionsExport';
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
import { leaguesHasCatches, leaguesHasKC, TaskWithoutID } from './leagues';

export const hardTasks: TaskWithoutID[] = [
	{
		name: 'Complete the Hard Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.hard))[0];
		}
	},
	{
		name: 'Complete the Hard Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.hard))[0];
		}
	},
	{
		name: 'Defeat a black demon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.BlackDemon.id] ?? 0) >= 1;
		}
	},
	{
		name: 'Smith 100 Mithril bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Mithril ore') >= 100 && cl.amount('Mithril bar') >= 100;
		}
	},
	{
		name: 'Defeat a lava dragon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.LavaDragon.id] ?? 0) >= 1;
		}
	},
	{
		name: 'Complete 100 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 100;
		}
	},
	{
		name: 'Do 50 laps at the Ape Atoll Course',
		has: async ({ lapScores }) => {
			return (lapScores[6] ?? 0) >= 50;
		}
	},
	{
		name: 'Obtain 500 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 500;
		}
	},
	{
		name: 'Reach combat level 95',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 95;
		}
	},
	{
		name: 'Reach total level 1500',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 1500;
		}
	},
	{
		name: 'Defeat Tempoross 100 times',
		has: async ({ minigames }) => {
			return minigames.tempoross >= 100;
		}
	},
	{
		name: 'Complete 100 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 100;
		}
	},
	{
		name: 'Defeat Wintertodt 250 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 250;
		}
	},
	{
		name: 'Complete the Champions Challenge',
		has: async ({ minigames }) => {
			return minigames.champions_challenge >= 1;
		}
	},
	{
		name: 'Complete 100 Castle Wars games',
		has: async ({ minigames }) => {
			return minigames.castle_wars >= 100;
		}
	},
	{
		name: 'Complete 100 Temple Treks',
		has: async ({ minigames }) => {
			return minigames.temple_trekking >= 100;
		}
	},
	{
		name: 'Complete 100 Last Man Standing',
		has: async ({ minigames }) => {
			return minigames.lms >= 100;
		}
	},
	{
		name: 'Catch 200 Red salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Red salamander', 200);
		}
	},
	{
		name: 'Mix 1000 Prayer potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => cl.amount(i))) >= 1000;
		}
	},
	{
		name: 'Mix 100 Super attack potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super attack potion (3)', 'Super attack potion (4)']).map(i => cl.amount(i))) >=
				100
			);
		}
	},
	{
		name: 'Mix 100 Super strength potions.',
		has: async ({ cl }) => {
			return (
				sumArr(
					resolveItems(['Super strength potion (3)', 'Super strength potion (4)']).map(i => cl.amount(i))
				) >= 100
			);
		}
	},
	{
		name: 'Mix 100 Super defence potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super defence potion (3)', 'Super defence potion (4)']).map(i => cl.amount(i))) >=
				100
			);
		}
	},
	{
		name: 'Mix 100 Ranging potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Ranging potion (3)', 'Ranging potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Mix 100 Magic potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Magic potion (3)', 'Magic potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Mix 100 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Mix 100 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		name: 'Receive 10 different Gilded items',
		has: async ({ cl }) => {
			return allGildedItems.filter(i => cl.has(i)).length >= 10;
		}
	},
	{
		name: 'Defeat 100 Black dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.BlackDragon, 100);
		}
	},
	{
		name: 'Defeat 100 Steel dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.SteelDragon, 100);
		}
	},
	{
		name: 'Defeat 100 Blue dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.BlueDragon, 100);
		}
	},
	{
		name: 'Defeat 10 Scorpia',
		has: async args => {
			return leaguesHasKC(args, Monsters.Scorpia, 10);
		}
	},
	{
		name: 'Defeat 10 Obor',
		has: async args => {
			return leaguesHasKC(args, Monsters.Obor, 10);
		}
	},
	{
		name: 'Defeat 10 Bryophyta',
		has: async args => {
			return leaguesHasKC(args, Monsters.Bryophyta, 10);
		}
	},
	{
		name: 'Receive every monkey backpack',
		has: async ({ cl }) => {
			return monkeyBackpacksCL.every(i => cl.has(i));
		}
	}
];
