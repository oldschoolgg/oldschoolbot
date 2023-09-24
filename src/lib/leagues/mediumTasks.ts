import { sumArr } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { eggs } from '../../mahoji/commands/offer';
import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { BitField } from '../constants';
import {
	barrowsChestCL,
	chambersOfXericCL,
	customPetsCL,
	cyclopsCL,
	inventorOutfit,
	theatreOfBLoodCL,
	toaCL,
	treeBeardCL
} from '../data/CollectionsExport';
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
import { implings } from '../implings';
import { QueenBlackDragon } from '../minions/data/killableMonsters/custom/demiBosses';
import { TormentedDemon } from '../minions/data/killableMonsters/custom/TormentedDemon';
import { baseUserKourendFavour, UserKourendFavour } from '../minions/data/kourendFavour';
import Darts from '../skilling/skills/fletching/fletchables/darts';
import Javelins from '../skilling/skills/fletching/fletchables/javelins';
import { ashes } from '../skilling/skills/prayer';
import { ItemBank } from '../types';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { LampTable } from '../xpLamps';
import { leaguesHasCatches, leaguesHasKC, leaguesSlayerTaskForMonster, Task } from './leaguesUtils';
import { calculateChargedItems, calculateTiarasMade, calculateTotalMahoganyHomesPoints } from './stats';

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
		name: 'Defeat 100 greater demons',
		has: async ({ monsterScores }) => {
			return (monsterScores[Monsters.GreaterDemon.id] ?? 0) >= 100;
		}
	},
	{
		id: 1014,
		name: 'Smelt 500 Iron bars from scratch',
		has: async ({ smeltingStats }) => {
			return smeltingStats.amount('Iron bar') >= 500;
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
		name: 'Reach combat level 90',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 90;
		}
	},
	{
		id: 1024,
		name: 'Reach total level 1000',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 1000;
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
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Restore potion (3)', 'Restore potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 100
			);
		}
	},
	{
		id: 1032,
		name: 'Mix 100 Energy potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Energy potion (3)', 'Energy potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 100
			);
		}
	},
	{
		id: 1033,
		name: 'Mix 500 Prayer potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
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
		name: 'Open an Eternal impling jar',
		has: async ({ opens }) => {
			return opens.has('Eternal impling jar');
		}
	},
	{
		id: 1047,
		name: 'Open an Infernal impling jar',
		has: async ({ opens }) => {
			return opens.has('Infernal impling jar');
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
			return disassembledItems.length >= 1;
		}
	},
	{
		id: 1052,
		name: 'Complete 20 Farming contracts',
		has: async ({ user }) => {
			const contract = getFarmingContractOfUser(user);
			return contract.contractsCompleted >= 20;
		}
	},
	{
		id: 1053,
		name: 'Offer a chewed bones',
		has: async ({ userStats }) => {
			return userStats.slayer_chewed_offered >= 1;
		}
	},
	{
		id: 1054,
		name: 'Offer an unsired',
		has: async ({ userStats }) => {
			return userStats.slayer_unsired_offered >= 1;
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
		has: async ({ userStats }) => {
			return Object.keys(userStats.monster_scores as ItemBank).length >= 25;
		}
	},
	{
		id: 1059,
		name: 'Slay 20 superior slayer creatures',
		has: async ({ userStats }) => {
			return userStats.slayer_superior_count >= 20;
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
		has: async ({ userStats }) => {
			return userStats.honour_level === 5;
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
			return minigames.gauntlet >= 100;
		}
	},
	{
		id: 1066,
		name: 'Achieve maximum Kourend favour',
		has: async ({ mahojiUser }) => {
			const currentUserFavour = (mahojiUser.kourend_favour ?? baseUserKourendFavour) as any as UserKourendFavour;
			return Object.values(currentUserFavour).every(val => val >= 100);
		}
	},
	{
		id: 1067,
		name: 'Build a Tame Nursery',
		has: async ({ mahojiUser }) => {
			return mahojiUser.nursery !== null;
		}
	},
	{
		id: 1068,
		name: 'Make 100 Simple kibble',
		has: async ({ cl }) => {
			return cl.amount('Simple kibble') >= 100;
		}
	},
	{
		id: 1069,
		name: 'Kill a Tormented Demon',
		has: async args => {
			return leaguesHasKC(args, TormentedDemon, 1);
		}
	},
	{
		id: 1070,
		name: 'Kill the Queen Black dragon',
		has: async args => {
			return leaguesHasKC(args, QueenBlackDragon, 1);
		}
	},
	{
		id: 1071,
		name: 'Achieve base level 80 stats',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 80);
		}
	},
	{
		id: 1072,
		name: 'Disassemble 1000 Rune armor pieces',
		has: async ({ disassembledItems }) => {
			return (
				sumArr(
					resolveItems([
						'Rune full helm',
						'Rune med helm',
						'Rune platebody',
						'Rune platelegs',
						'Rune boots',
						'Rune chainbody',
						'Rune plateskirt',
						'Rune sq shield',
						'Rune kiteshield'
					]).map(i => disassembledItems.amount(i))
				) >= 1000
			);
		}
	},
	{
		id: 1073,
		name: 'Open 100x TMB',
		has: async ({ opens }) => {
			return opens.amount('Tradeable mystery box') >= 100;
		}
	},
	{
		id: 1074,
		name: 'Open 100x UMB',
		has: async ({ opens }) => {
			return opens.amount('Untradeable mystery box') >= 100;
		}
	},
	{
		id: 1075,
		name: 'Open 30x EMB',
		has: async ({ opens }) => {
			return opens.amount('Equippable mystery box') >= 30;
		}
	},
	{
		id: 1076,
		name: 'Open 10x CMB',
		has: async ({ opens }) => {
			return opens.amount('Clothing mystery box') >= 10;
		}
	},
	{
		id: 1077,
		name: 'Open 5x HMB',
		has: async ({ opens }) => {
			return opens.amount('Holiday mystery box') >= 5;
		}
	},
	{
		id: 1078,
		name: 'Open 5x PMB',
		has: async ({ opens }) => {
			return opens.amount('Pet mystery box') >= 5;
		}
	},
	{
		id: 1079,
		name: 'Kill every Godwars Dungeon Boss 50 times',
		has: async args => {
			return [
				Monsters.GeneralGraardor,
				Monsters.CommanderZilyana,
				Monsters.KrilTsutsaroth,
				Monsters.Kreearra
			].every(mon => leaguesHasKC(args, mon, 50));
		}
	},
	{
		id: 1080,
		name: 'Kill Zulrah',
		has: async args => {
			return leaguesHasKC(args, Monsters.Zulrah, 1);
		}
	},
	{
		id: 1081,
		name: 'Kill the Corporeal Beast',
		has: async args => {
			return leaguesHasKC(args, Monsters.CorporealBeast, 1);
		}
	},
	{
		id: 1082,
		name: 'Kill Hespori 25 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Hespori, 25);
		}
	},
	{
		id: 1083,
		name: 'Fletch 1000 Magic shortbows',
		has: async ({ cl }) => {
			return ['Magic shortbow (u)', 'Magic shortbow'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1084,
		name: 'Fletch 1000 Magic longbows',
		has: async ({ cl }) => {
			return ['Magic longbow (u)', 'Magic longbow'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1085,
		name: 'Fletch 1000 Rune arrows',
		has: async ({ cl }) => {
			return ['Rune arrow', 'Headless arrow', 'Rune arrowtips'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1086,
		name: 'Fletch 1000 Adamant arrows',
		has: async ({ cl }) => {
			return ['Adamant arrow', 'Headless arrow', 'Adamant arrowtips'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1087,
		name: 'Fletch 1000 Amethyst arrows',
		has: async ({ cl }) => {
			return ['Amethyst arrow', 'Headless arrow', 'Amethyst arrowtips'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1088,
		name: 'Fletch 1000 Dragon arrows',
		has: async ({ cl }) => {
			return ['Dragon arrow', 'Headless arrow', 'Dragon arrowtips'].every(i => cl.amount(i) >= 1000);
		}
	},
	{
		id: 1089,
		name: 'Catch 5 Lucky implings',
		has: async ({ cl }) => {
			return cl.amount('Lucky impling jar') >= 5;
		}
	},
	{
		id: 1090,
		name: 'Catch 5 Dragon implings',
		has: async ({ cl }) => {
			return cl.amount('Dragon impling jar') >= 5;
		}
	},
	{
		id: 1091,
		name: 'Sacrifice 500m GP',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.amount('Coins') >= 500_000_000;
		}
	},
	{
		id: 1092,
		name: 'Sacrifice all barrows items',
		has: async ({ sacrificedBank }) => {
			return barrowsChestCL.every(i => sacrificedBank.has(i));
		}
	},
	{
		id: 1093,
		name: 'Sacrifice 50 different items',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.length >= 50;
		}
	},
	{
		id: 1094,
		name: 'Complete 5 Gargoyle slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.Gargoyle, 5);
		}
	},
	{
		id: 1095,
		name: 'Complete 5 Blue dragon slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.BlueDragon, 5);
		}
	},
	{
		id: 1096,
		name: 'Complete 5 Abyssal Demon slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.AbyssalDemon, 5);
		}
	},
	{
		id: 1097,
		name: 'Complete 5 Hellhound slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.Hellhound, 5);
		}
	},
	{
		id: 1098,
		name: 'Complete 5 Nechryael slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.Nechryael, 5);
		}
	},
	{
		id: 1099,
		name: 'Do 10 High gambles in Barb assault',
		has: async ({ userStats }) => {
			return userStats.high_gambles >= 10;
		}
	},
	{
		id: 1100,
		name: 'Reach 15% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 15;
		}
	},
	{
		id: 1101,
		name: 'Construct 10,000 objects',
		has: async ({ conStats }) => {
			return sumArr(conStats.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 1102,
		name: 'Chop 5000 of any logs',
		has: async ({ woodcuttingStats }) => {
			return sumArr(woodcuttingStats.items().map(i => i[1])) >= 5000;
		}
	},
	{
		id: 1103,
		name: 'Alch 1000 of any item',
		has: async ({ alchingStats }) => {
			return sumArr(alchingStats.items().map(i => i[1])) >= 1000;
		}
	},
	{
		id: 1104,
		name: 'Clean 500 herbs',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.herbs.items().map(i => i[1])) >= 500;
		}
	},
	{
		id: 1105,
		name: 'Mix 500 unf potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.unfPots.items().map(i => i[1])) >= 500;
		}
	},
	{
		id: 1106,
		name: 'Mix 500 potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.pots.items().map(i => i[1])) >= 500;
		}
	},
	{
		id: 1107,
		name: 'Mine 1000 ores',
		has: async ({ miningStats }) => {
			return sumArr(miningStats.items().map(i => i[1])) >= 1000;
		}
	},
	{
		id: 1108,
		name: 'Burn 500 logs',
		has: async ({ firemakingStats }) => {
			return sumArr(firemakingStats.items().map(i => i[1])) >= 500;
		}
	},
	{
		id: 1109,
		name: 'Smith items from 500 Iron bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Iron bar') >= 500;
		}
	},
	{
		id: 1110,
		name: 'Smith items from 1000 Bronze bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Bronze bar') >= 1000;
		}
	},
	{
		id: 1111,
		name: 'Cast 500 spells',
		has: async ({ spellCastingStats }) => {
			return sumArr(spellCastingStats.map(i => i.qty)) >= 500;
		}
	},
	{
		id: 1112,
		name: 'Collect 500 Blue dragon scales',
		has: async ({ collectingStats }) => {
			return collectingStats.amount('Blue dragon scale') >= 500;
		}
	},
	{
		id: 1113,
		name: 'Collect 500 Mort myre fungus',
		has: async ({ collectingStats }) => {
			return collectingStats.amount('Mort myre fungus') >= 500;
		}
	},
	{
		id: 1114,
		name: "Collect 500 Red spider's eggs",
		has: async ({ collectingStats }) => {
			return collectingStats.amount("Red spiders' eggs") >= 500;
		}
	},
	{
		id: 1115,
		name: 'Smith items from 2500 Steel bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Steel bar') >= 2500;
		}
	},
	{
		id: 1116,
		name: 'Create every godsword',
		has: async ({ cl }) => {
			return resolveItems([
				'Armadyl godsword',
				'Bandos godsword',
				'Saradomin godsword',
				'Zamorak godsword',
				'Ancient godsword'
			]).every(gs => cl.has(gs));
		}
	},
	{
		id: 1117,
		name: 'Finish the Treebeard CL',
		has: async ({ cl }) => {
			return treeBeardCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 1118,
		name: 'Acquire, complete and open 200 Beginner clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (beginner)') >= 200;
		}
	},
	{
		id: 1119,
		name: 'Acquire, complete and open 200 Easy clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (easy)') >= 200;
		}
	},
	{
		id: 1120,
		name: 'Acquire, complete and open 200 Medium clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (medium)') >= 200;
		}
	},
	{
		id: 1121,
		name: 'Acquire, complete and open 200 Hard clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (hard)') >= 200;
		}
	},
	{
		id: 1122,
		name: 'Acquire, complete and open 50 Elite clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elite)') >= 50;
		}
	},
	{
		id: 1123,
		name: 'Acquire, complete and open 20 Master clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (master)') >= 20;
		}
	},
	{
		id: 1124,
		name: 'Acquire, complete and open 10 Grandmaster clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (grandmaster)') >= 10;
		}
	},
	{
		id: 1125,
		name: 'Build and fill all hard stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Hard').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 1126,
		name: 'Build and fill all elite stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Elite').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 1128,
		name: 'Offer 5 of each bird egg',
		has: async ({ userStats }) => {
			let vals = Object.values(userStats.bird_eggs_offered_bank as ItemBank);
			return vals.length === eggs.length && vals.every(i => Number(i) >= 5);
		}
	},
	{
		id: 1129,
		name: 'Catch 1 of every impling passively',
		has: async ({ userStats }) => {
			return Object.keys(userStats.passive_implings_bank as ItemBank).length === Object.keys(implings).length;
		}
	},
	{
		id: 1130,
		name: 'Scatter 100 of every ashes',
		has: async ({ userStats }) => {
			let vals = Object.values(userStats.scattered_ashes_bank as ItemBank);
			return vals.length === ashes.length && vals.every(i => i >= 100);
		}
	},
	{
		id: 1131,
		name: 'Receive 25,000 Prayer XP from the ash sanctifier',
		has: async ({ userStats }) => {
			return userStats.ash_sanctifier_prayer_xp >= 25_000;
		}
	},
	{
		id: 1132,
		name: 'Receive 50,000 XP from silverhawk boots',
		has: async ({ userStats }) => {
			return userStats.silverhawk_boots_passive_xp >= 50_000;
		}
	},
	{
		id: 1133,
		name: 'Upgrade 25 clues with the clue upgrader',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.clue_upgrader_bank as ItemBank)) >= 25;
		}
	},
	{
		id: 1134,
		name: 'Tan 1000 hides with the portable tanner',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.portable_tanner_bank as ItemBank)) >= 1000;
		}
	},
	{
		id: 1135,
		name: 'Receive 1000 bars from an adze',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.bars_from_adze_bank as ItemBank)) >= 1000;
		}
	},
	{
		id: 1136,
		name: 'Receive 250 ores from ore spirits',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.ores_from_spirits_bank as ItemBank)) >= 250;
		}
	},
	{
		id: 1137,
		name: 'Smelt 1000 bars with Klik',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.bars_from_klik_bank as ItemBank)) >= 1000;
		}
	},
	{
		id: 1138,
		name: 'Open the Crystal chest 50 times',
		has: async ({ opens }) => {
			return opens.amount('Crystal key') >= 50;
		}
	},
	{
		id: 1139,
		name: 'Fletch 10,000 javelins',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Javelins) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 10_000;
		}
	},
	{
		id: 1140,
		name: 'Fletch 100,000 darts',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Darts) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 100_000;
		}
	},
	{
		id: 1142,
		name: 'Charge 1000x Ring of wealth',
		has: async ({ user }) => {
			const { wealthCharged } = await calculateChargedItems(user);
			return wealthCharged >= 1000;
		}
	},
	{
		id: 1143,
		name: 'Charge 1000x Amulet of glory',
		has: async ({ user }) => {
			const { gloriesCharged } = await calculateChargedItems(user);
			return gloriesCharged >= 1000;
		}
	},
	{
		id: 1144,
		name: 'Receive, and alch, a Magical artifact',
		has: async ({ user, alchingStats }) => {
			return user.cl.has('Magical artifact') && alchingStats.has('Magical artifact');
		}
	},
	{
		id: 1145,
		name: 'Complete 100 games of Trouble brewing',
		has: async ({ minigames }) => {
			return minigames.trouble_brewing >= 100;
		}
	},
	{
		id: 1146,
		name: 'Runecraft 1000 Tiaras',
		has: async ({ user }) => {
			const tiarasMade = await calculateTiarasMade(user);
			return sumArr(tiarasMade.items().map(i => i[1])) >= 1000;
		}
	},
	{
		id: 1147,
		name: 'Receive 1000 Carpenter points in Mahogany Homes',
		has: async ({ user }) => {
			return (await calculateTotalMahoganyHomesPoints(user)) >= 1000;
		}
	},
	{
		id: 1149,
		name: "Receive a Giant's hand",
		has: async ({ user }) => {
			return user.cl.has("Giant's hand");
		}
	},
	{
		id: 1150,
		name: 'Receive a Materials bag',
		has: async ({ user }) => {
			return user.cl.has('Materials bag');
		}
	},
	{
		id: 1151,
		name: "Receive the full Inventors' outfit.",
		has: async ({ user }) => {
			return inventorOutfit.every(i => user.cl.has(i));
		}
	},
	{
		id: 1152,
		name: 'Use a Guthix engram',
		has: async ({ user }) => {
			return user.bitfield.includes(BitField.HasGuthixEngram);
		}
	},
	{
		id: 1153,
		name: 'Have 3 unique items destroyed by the Chincannon',
		has: async ({ userStats }) => {
			const bank = new Bank(userStats.chincannon_destroyed_loot_bank as ItemBank);
			const uniques = [...chambersOfXericCL, ...theatreOfBLoodCL, ...toaCL];
			const destroyedUniques = bank.items().filter(i => uniques.includes(i[0].id));
			return destroyedUniques.length >= 5;
		}
	}
];
