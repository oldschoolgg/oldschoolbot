import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import {
	allGildedItems,
	brokenPernixOutfit,
	brokenTorvaOutfit,
	brokenVirtusOutfit,
	customPetsCL,
	masterCapesCL,
	monkeyBackpacksCL,
	pernixOutfit,
	skillingPetsCL,
	torvaOutfit,
	virtusOutfit
} from '../data/CollectionsExport';
import { PartyhatTable } from '../data/holidayItems';
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
import { Inventions } from '../invention/inventions';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, leaguesHasKC, Task } from './leagues';

export const hardTasks: Task[] = [
	{
		id: 2000,
		name: 'Complete the Hard Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.hard))[0];
		}
	},
	{
		id: 2001,
		name: 'Complete the Hard Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.hard))[0];
		}
	},
	{
		id: 2002,
		name: 'Complete the Hard Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.hard))[0];
		}
	},
	{
		id: 2003,
		name: 'Complete the Hard Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.hard))[0];
		}
	},
	{
		id: 2004,
		name: 'Complete the Hard Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.hard))[0];
		}
	},
	{
		id: 2005,
		name: 'Complete the Hard Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.hard))[0];
		}
	},
	{
		id: 2006,
		name: 'Complete the Hard Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.hard))[0];
		}
	},
	{
		id: 2007,
		name: 'Complete the Hard Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.hard))[0];
		}
	},
	{
		id: 2008,
		name: 'Complete the Hard Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.hard))[0];
		}
	},
	{
		id: 2009,
		name: 'Complete the Hard Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.hard))[0];
		}
	},
	{
		id: 2010,
		name: 'Complete the Hard Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.hard))[0];
		}
	},
	{
		id: 2011,
		name: 'Complete the Hard Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.hard))[0];
		}
	},
	{
		id: 2012,
		name: 'Defeat a black demon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.BlackDemon.id] ?? 0) >= 1;
		}
	},
	{
		id: 2013,
		name: 'Smith 100 Mithril bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Mithril ore') >= 100 && cl.amount('Mithril bar') >= 100;
		}
	},
	{
		id: 2014,
		name: 'Defeat a lava dragon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.LavaDragon.id] ?? 0) >= 1;
		}
	},
	{
		id: 2015,
		name: 'Complete 100 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 100;
		}
	},
	{
		id: 2016,
		name: 'Do 50 laps at the Ape Atoll Course',
		has: async ({ lapScores }) => {
			return (lapScores[6] ?? 0) >= 50;
		}
	},
	{
		id: 2017,
		name: 'Obtain 500 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 500;
		}
	},
	{
		id: 2018,
		name: 'Reach combat level 95',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 95;
		}
	},
	{
		id: 2019,
		name: 'Reach total level 1500',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 1500;
		}
	},
	{
		id: 2020,
		name: 'Defeat Tempoross 100 times',
		has: async ({ minigames }) => {
			return minigames.tempoross >= 100;
		}
	},
	{
		id: 2021,
		name: 'Complete 100 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 100;
		}
	},
	{
		id: 2022,
		name: 'Defeat Wintertodt 250 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 250;
		}
	},
	{
		id: 2023,
		name: 'Complete the Champions Challenge',
		has: async ({ minigames }) => {
			return minigames.champions_challenge >= 1;
		}
	},
	{
		id: 2024,
		name: 'Complete 100 Castle Wars games',
		has: async ({ minigames }) => {
			return minigames.castle_wars >= 100;
		}
	},
	{
		id: 2025,
		name: 'Complete 100 Temple Treks',
		has: async ({ minigames }) => {
			return minigames.temple_trekking >= 100;
		}
	},
	{
		id: 2026,
		name: 'Complete 100 Last Man Standing',
		has: async ({ minigames }) => {
			return minigames.lms >= 100;
		}
	},
	{
		id: 2028,
		name: 'Catch 200 Red salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Red salamander', 200);
		}
	},
	{
		id: 2029,
		name: 'Mix 1000 Prayer potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => cl.amount(i))) >= 1000;
		}
	},
	{
		id: 2030,
		name: 'Mix 100 Super attack potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super attack potion (3)', 'Super attack potion (4)']).map(i => cl.amount(i))) >=
				100
			);
		}
	},
	{
		id: 2031,
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
		id: 2032,
		name: 'Mix 100 Super defence potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super defence potion (3)', 'Super defence potion (4)']).map(i => cl.amount(i))) >=
				100
			);
		}
	},
	{
		id: 2033,
		name: 'Mix 100 Ranging potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Ranging potion (3)', 'Ranging potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 2034,
		name: 'Mix 100 Magic potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Magic potion (3)', 'Magic potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 2035,
		name: 'Mix 100 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 2036,
		name: 'Mix 100 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 2037,
		name: 'Receive 10 different Gilded items',
		has: async ({ cl }) => {
			return allGildedItems.filter(i => cl.has(i)).length >= 10;
		}
	},
	{
		id: 2038,
		name: 'Defeat 100 Black dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.BlackDragon, 100);
		}
	},
	{
		id: 2039,
		name: 'Defeat 100 Steel dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.SteelDragon, 100);
		}
	},
	{
		id: 2040,
		name: 'Defeat 100 Blue dragons',
		has: async args => {
			return leaguesHasKC(args, Monsters.BlueDragon, 100);
		}
	},
	{
		id: 2041,
		name: 'Defeat 10 Scorpia',
		has: async args => {
			return leaguesHasKC(args, Monsters.Scorpia, 10);
		}
	},
	{
		id: 2042,
		name: 'Defeat 10 Obor',
		has: async args => {
			return leaguesHasKC(args, Monsters.Obor, 10);
		}
	},
	{
		id: 2043,
		name: 'Defeat 10 Bryophyta',
		has: async args => {
			return leaguesHasKC(args, Monsters.Bryophyta, 10);
		}
	},
	{
		id: 2044,
		name: 'Receive every monkey backpack',
		has: async ({ cl }) => {
			return monkeyBackpacksCL.every(i => cl.has(i));
		}
	},
	{
		id: 2045,
		name: 'Complete 50 games of Monkey Rumble',
		has: async ({ minigames }) => {
			return minigames.monkey_rumble >= 50;
		}
	},
	{
		id: 2046,
		name: 'Finish the skilling pets CL',
		has: async ({ cl }) => {
			return skillingPetsCL.every(i => cl.has(i));
		}
	},
	{
		id: 2047,
		name: 'Receive an Abyssal cape',
		has: async ({ cl }) => {
			return cl.has('Abyssal cape');
		}
	},
	{
		id: 2048,
		name: 'Mix 100 Heat res. brews from scratch',
		has: async ({ cl, skillsLevels }) => {
			return (
				skillsLevels.farming > 99 &&
				skillsLevels.herblore > 120 &&
				cl.amount('Athelas seed') >= 1 &&
				cl.amount('Athelas') >= 50 &&
				cl.amount('Heat res. vial') >= 100 &&
				cl.amount('Heat res. brew') >= 100
			);
		}
	},
	{
		id: 2049,
		name: 'Buy any master cape',
		has: async ({ cl }) => {
			return masterCapesCL.some(c => cl.has(c));
		}
	},
	{
		id: 2050,
		name: 'Create every piece of Nex armor from scratch',
		has: async ({ cl }) => {
			return [
				...brokenTorvaOutfit,
				...torvaOutfit,
				...pernixOutfit,
				...brokenPernixOutfit,
				...virtusOutfit,
				...brokenVirtusOutfit
			].every(i => cl.has(i));
		}
	},
	{
		id: 2051,
		name: 'Receive any 10 custom pets',
		has: async ({ cl }) => {
			return customPetsCL.filter(i => cl.has(i)).length >= 10;
		}
	},
	{
		id: 2052,
		name: 'Open a Blacksmith crate',
		has: async ({ opens }) => {
			return opens.has('Blacksmith crate');
		}
	},
	{
		id: 2053,
		name: 'Receive any partyhat',
		has: async ({ cl }) => {
			return PartyhatTable.allItems.some(i => cl.has(i));
		}
	},
	{
		id: 2054,
		name: 'Finish the Baxtorian Bathhouse CL',
		has: async ({ cl }) => {
			return resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire', 'Phoenix eggling']).some(i =>
				cl.has(i)
			);
		}
	},
	{
		id: 2055,
		name: 'Create any invention',
		has: async ({ cl }) => {
			return Inventions.some(i => cl.has(i.item.id));
		}
	},
	{
		id: 2056,
		name: 'Disassemble 100 unique items',
		has: async ({ disassembledItems }) => {
			return disassembledItems.length >= 100;
		}
	},
	{
		id: 2057,
		name: 'Achieve base level 90 stats',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 90);
		}
	},
	{
		id: 2058,
		name: 'Do a total of 3000 agility course laps ',
		has: async ({ lapScores }) => {
			return sumArr(Object.values(lapScores)) >= 3000;
		}
	}
];
