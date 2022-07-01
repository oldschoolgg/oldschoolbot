import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { cluesBeginnerCL, cluesEasyCL, cluesMediumCL, customPetsCL, cyclopsCL } from '../data/CollectionsExport';
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
import { baseUserKourendFavour, UserKourendFavour } from '../minions/data/kourendFavour';
import { ItemBank } from '../types';
import { calcCombatLevel, calcTotalLevel, itemID } from '../util';
import resolveItems from '../util/resolveItems';
import { LampTable } from '../xpLamps';
import { leaguesHasCatches, leaguesHasKC, Task } from './leagues';

export const mediumTasks: Task[] = [
	{
		id: 1001,
		name: 'Complete the Medium Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.medium))[0];
		}
	},
	{
		id: 1002,
		name: 'Complete the Medium Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.medium))[0];
		}
	},
	{
		id: 1003,
		name: 'Complete the Medium Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.medium))[0];
		}
	},
	{
		id: 1004,
		name: 'Complete the Medium Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.medium))[0];
		}
	},
	{
		id: 1005,
		name: 'Complete the Medium Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.medium))[0];
		}
	},
	{
		id: 1006,
		name: 'Complete the Medium Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.medium))[0];
		}
	},
	{
		id: 1007,
		name: 'Complete the Medium Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.medium))[0];
		}
	},
	{
		id: 1008,
		name: 'Complete the Medium Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.medium))[0];
		}
	},
	{
		id: 1009,
		name: 'Complete the Medium Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.medium))[0];
		}
	},
	{
		id: 1010,
		name: 'Complete the Medium Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.medium))[0];
		}
	},
	{
		id: 1011,
		name: 'Complete the Medium Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.medium))[0];
		}
	},
	{
		id: 1012,
		name: 'Complete the Medium Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.medium))[0];
		}
	},
	{
		id: 1013,
		name: 'Defeat a greater demon',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.GreaterDemon.id] ?? 0) >= 1;
		}
	},
	{
		id: 1014,
		name: 'Smith 100 Iron bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Iron ore') >= 100 && cl.amount('Iron bar') >= 100;
		}
	},
	{
		id: 1015,
		name: 'Build a pool in your PoH',
		has: async ({ poh }) => {
			return poh.pool !== null;
		}
	},
	{
		id: 1016,
		name: 'Build a throne in your PoH',
		has: async ({ poh }) => {
			return poh.throne !== null;
		}
	},
	{
		id: 1017,
		name: 'Build a jewellery box in your PoH',
		has: async ({ poh }) => {
			return poh.jewellery_box !== null;
		}
	},
	{
		id: 1018,
		name: 'Build a prayer altar in your PoH',
		has: async ({ poh }) => {
			return poh.prayer_altar !== null;
		}
	},
	{
		id: 1019,
		name: 'Build a spellbook altar in your PoH',
		has: async ({ poh }) => {
			return poh.spellbook_altar !== null;
		}
	},
	{
		id: 1020,
		name: 'Complete 50 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 50;
		}
	},
	{
		id: 1021,
		name: 'Do 50 laps at the Varrock Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[4] ?? 0) >= 50;
		}
	},
	{
		id: 1022,
		name: 'Obtain 100 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 100;
		}
	},
	{
		id: 1023,
		name: 'Reach combat level 70',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 70;
		}
	},
	{
		id: 1024,
		name: 'Reach total level 600',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 600;
		}
	},
	{
		id: 1025,
		name: 'Defeat Tempoross 50 times',
		has: async ({ minigames }) => {
			return minigames.tempoross >= 50;
		}
	},
	{
		id: 1026,
		name: 'Complete 20 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 20;
		}
	},
	{
		id: 1027,
		name: 'Receive the full Angler outfit',
		has: async ({ cl }) => {
			return resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']).every(i => cl.has(i));
		}
	},
	{
		id: 1028,
		name: 'Defeat Wintertodt 50 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 50;
		}
	},
	{
		id: 1029,
		name: 'Complete 10 Castle Wars games',
		has: async ({ minigames }) => {
			return minigames.castle_wars >= 10;
		}
	},
	{
		id: 1030,
		name: 'Catch 200 Orange salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Orange salamander', 200);
		}
	},
	{
		id: 1031,
		name: 'Mix 100 Restore potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Restore potion (3)', 'Restore potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 1032,
		name: 'Mix 100 Energy potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Energy potion (3)', 'Energy potion (4)']).map(i => cl.amount(i))) >= 100;
		}
	},
	{
		id: 1033,
		name: 'Mix 500 Prayer potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => cl.amount(i))) >= 500;
		}
	},
	{
		id: 1034,
		name: 'Obtain 5 unique items from Medium caskets',
		has: async ({ cl }) => {
			return cluesMediumCL.filter(i => cl.has(i)).length >= 5;
		}
	},
	{
		id: 1035,
		name: 'Finish the beginner clue CL',
		has: async ({ cl }) => {
			return cluesBeginnerCL.filter(i => cl.has(i)).length === cluesBeginnerCL.length;
		}
	},
	{
		id: 1036,
		name: 'Finish the easy clue CL',
		has: async ({ cl }) => {
			return cluesEasyCL.filter(i => cl.has(i)).length === cluesEasyCL.length;
		}
	},
	{
		id: 1037,
		name: 'Finish the easy clue CL',
		has: async ({ cl }) => {
			return cluesEasyCL.filter(i => cl.has(i)).length === cluesEasyCL.length;
		}
	},
	{
		id: 1038,
		name: 'Receive every defender',
		has: async ({ cl }) => {
			return cyclopsCL.every(i => cl.has(i));
		}
	},
	{
		id: 1039,
		name: 'Complete 5 games of Monkey Rumble',
		has: async ({ minigames }) => {
			return minigames.monkey_rumble >= 5;
		}
	},
	{
		id: 1040,
		name: 'Receive any 5 custom pets',
		has: async ({ cl }) => {
			return customPetsCL.filter(i => cl.has(i)).length >= 5;
		}
	},
	{
		id: 1041,
		name: 'Open a Christmas cracker',
		has: async ({ opens }) => {
			return opens.amount('Christmas cracker') >= 1;
		}
	},
	{
		id: 1042,
		name: 'Open a Monkey crate',
		has: async ({ opens }) => {
			return opens.has('Monkey crate');
		}
	},
	{
		id: 1043,
		name: 'Open a Magic crate',
		has: async ({ opens }) => {
			return opens.has('Magic crate');
		}
	},
	{
		id: 1044,
		name: 'Open a Chimpling jar',
		has: async ({ opens }) => {
			return opens.has('Chimpling jar');
		}
	},
	{
		id: 1045,
		name: 'Open a Mystery impling jar',
		has: async ({ opens }) => {
			return opens.has('Mystery impling jar');
		}
	},
	{
		id: 1046,
		name: 'Open a Eternal impling jar',
		has: async ({ opens }) => {
			return opens.has('Eternal impling jar');
		}
	},
	{
		id: 1047,
		name: 'Open a Infernal impling jar',
		has: async ({ opens }) => {
			return opens.has('Infernal impling jar');
		}
	},
	{
		id: 1048,
		name: 'Complete a Grandmaster clue scroll',
		has: async ({ clueScores }) => {
			return (clueScores[itemID('Clue scroll (grandmaster)')] ?? 0) >= 1;
		}
	},
	{
		id: 1049,
		name: 'Receive any XP lamp',
		has: async ({ cl }) => {
			return LampTable.allItems.some(i => cl.has(i));
		}
	},
	{
		id: 1050,
		name: 'Compete in the Fishing Contest',
		has: async ({ minigames }) => {
			return minigames.fishing_contest >= 1;
		}
	},
	{
		id: 1051,
		name: 'Disassemble some items',
		has: async ({ disassembledItems }) => {
			return disassembledItems.length >= 0;
		}
	},
	{
		id: 1052,
		name: 'Complete 20 Farming contracts',
		has: async ({ mahojiUser }) => {
			const contract = getFarmingContractOfUser(mahojiUser);
			return contract.contractsCompleted >= 20;
		}
	},
	{
		id: 1053,
		name: 'Offer a chewed bones',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_chewed_offered >= 1;
		}
	},
	{
		id: 1054,
		name: 'Offer an unsired',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_unsired_offered >= 1;
		}
	},
	{
		id: 1055,
		name: 'Do a birdhouse trip',
		has: async ({ activityCounts }) => {
			return (activityCounts.Birdhouse ?? 0) >= 1;
		}
	},
	{
		id: 1056,
		name: 'Complete 10 Item Contracts',
		has: async ({ mahojiUser }) => {
			return mahojiUser.total_item_contracts >= 10;
		}
	},
	{
		id: 1057,
		name: 'Achieve an Item Contract streak of 5',
		has: async ({ mahojiUser }) => {
			return mahojiUser.item_contract_streak >= 5;
		}
	},
	{
		id: 1058,
		name: 'Kill 25 unique monsters',
		has: async ({ mahojiUser }) => {
			return Object.keys(mahojiUser.monsterScores as ItemBank).length >= 25;
		}
	},
	{
		id: 1059,
		name: 'Slay 15 superior slayer creatures',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_superior_count >= 5;
		}
	},
	{
		id: 1060,
		name: 'Sacrifice 1b worth of items/GP',
		has: async ({ mahojiUser }) => {
			return mahojiUser.sacrificedValue >= 1_000_000_000;
		}
	},
	{
		id: 1061,
		name: 'Reach honour level 5',
		has: async ({ mahojiUser }) => {
			return mahojiUser.honour_level === 5;
		}
	},
	{
		id: 1062,
		name: 'Defeat Skotizo',
		has: async args => {
			return leaguesHasKC(args, Monsters.Skotizo, 1);
		}
	},
	{
		id: 1063,
		name: 'Defeat Skotizo 10 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Skotizo, 10);
		}
	},
	{
		id: 1064,
		name: 'Complete the Gauntlet',
		has: async ({ minigames }) => {
			return minigames.gauntlet >= 1;
		}
	},
	{
		id: 1065,
		name: 'Complete the Gauntlet 100 times',
		has: async ({ minigames }) => {
			return minigames.gauntlet >= 1;
		}
	},
	{
		id: 1066,
		name: 'Achieve maximum kourend favour',
		has: async ({ mahojiUser }) => {
			const currentUserFavour = (mahojiUser.kourend_favour ?? baseUserKourendFavour) as any as UserKourendFavour;
			return Object.values(currentUserFavour).every(val => val >= 100);
		}
	}
];
