import { sumArr } from 'e';
import { Monsters } from 'oldschooljs';

import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { barrowsChestCL, customPetsCL } from '../data/CollectionsExport';
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
import { Cookables } from '../skilling/skills/cooking';
import Fishing from '../skilling/skills/fishing';
import { ItemBank } from '../types';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, leaguesHasKC, leaguesSlayerTaskForMonster, Task } from './leaguesUtils';

export const easyTasks: Task[] = [
	{
		id: 1,
		name: 'Smelt 100 Bronze bars from scratch',
		has: async ({ smeltingStats }) => {
			return smeltingStats.amount('Bronze bar') >= 100;
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
			return activityCounts.TearsOfGuthix >= 1;
		}
	},
	{
		id: 20,
		name: 'Do 5 Pest Control Games',
		has: async ({ minigames }) => {
			return minigames.pest_control >= 5;
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
		name: 'Reach total level 500',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 500;
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
			return activityCounts.Offering >= 1;
		}
	},
	{
		id: 30,
		name: 'Complete a Fishing Trawler trip.',
		has: async ({ minigames }) => {
			return minigames.fishing_trawler >= 1;
		}
	},
	{
		id: 31,
		name: 'Mix 100 Attack potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(resolveItems(['Attack potion(3)', 'Attack potion(4)']).map(i => herbloreStats.pots.amount(i))) >=
				100
			);
		}
	},
	{
		id: 32,
		name: 'Mix 100 Antipoison potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(resolveItems(['Antipoison (3)', 'Antipoison (4)']).map(i => herbloreStats.pots.amount(i))) >= 100
			);
		}
	},
	{
		id: 33,
		name: 'Mix 100 Strength potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Strength potion (3)', 'Strength potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 100
			);
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
	},
	{
		id: 41,
		name: 'Fish 1000 fish',
		has: async ({ cl }) => {
			return sumArr(Fishing.Fishes.map(i => cl.amount(i.id))) >= 1000;
		}
	},
	{
		id: 42,
		name: 'Cook 1000 of anything',
		has: async ({ cl }) => {
			return sumArr(Cookables.map(i => cl.amount(i.id))) >= 1000;
		}
	},
	{
		id: 43,
		name: 'Complete a Farming contract',
		has: async ({ user }) => {
			const contract = getFarmingContractOfUser(user);
			return contract.contractsCompleted >= 1;
		}
	},
	{
		id: 44,
		name: 'Complete an Item Contract',
		has: async ({ mahojiUser }) => {
			return mahojiUser.total_item_contracts >= 1;
		}
	},
	{
		id: 45,
		name: 'Kill 10 unique monsters',
		has: async ({ mahojiUser }) => {
			return Object.keys(mahojiUser.monsterScores as ItemBank).length >= 10;
		}
	},
	{
		id: 46,
		name: 'Slay a superior slayer creature',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_superior_count >= 1;
		}
	},
	{
		id: 47,
		name: 'Sacrifice 100m worth of items/GP',
		has: async ({ mahojiUser }) => {
			return mahojiUser.sacrificedValue >= 100_000_000;
		}
	},
	{
		id: 48,
		name: 'Achieve base level 20 stats',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 20);
		}
	},
	{
		id: 49,
		name: 'Complete the barrows collection log',
		has: async ({ cl }) => {
			return barrowsChestCL.every(i => cl.has(i));
		}
	},
	{
		id: 50,
		name: 'Kill the King Black Dragon 100 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.KingBlackDragon, 100);
		}
	},
	{
		id: 51,
		name: 'Defeat Obor 5 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Obor, 5);
		}
	},
	{
		id: 52,
		name: 'Kill every Wilderness boss 5 times',
		has: async args => {
			return [
				Monsters.ChaosElemental,
				Monsters.ChaosFanatic,
				Monsters.Callisto,
				Monsters.CrazyArchaeologist,
				Monsters.KingBlackDragon,
				Monsters.Scorpia,
				Monsters.Venenatis,
				Monsters.Vetion
			].every(mon => leaguesHasKC(args, mon, 5));
		}
	},
	{
		id: 53,
		name: 'Kill every Dagannoth King 50 times',
		has: async args => {
			return [Monsters.DagannothPrime, Monsters.DagannothRex, Monsters.DagannothSupreme].every(mon =>
				leaguesHasKC(args, mon, 50)
			);
		}
	},
	{
		id: 54,
		name: 'Kill every Godwars Dungeon Boss',
		has: async args => {
			return [
				Monsters.GeneralGraardor,
				Monsters.CommanderZilyana,
				Monsters.KrilTsutsaroth,
				Monsters.Kreearra
			].every(mon => leaguesHasKC(args, mon, 1));
		}
	},
	{
		id: 55,
		name: 'Kill Hespori',
		has: async args => {
			return leaguesHasKC(args, Monsters.Hespori, 1);
		}
	},
	{
		id: 56,
		name: 'Kill Hespori 5 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Hespori, 5);
		}
	},
	{
		id: 57,
		name: 'Obtain a fire cape',
		has: async ({ cl }) => {
			return cl.has('Fire cape');
		}
	},
	{
		id: 58,
		name: 'Sacrifice 10 different items',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.length >= 10;
		}
	},
	{
		id: 59,
		name: 'Complete 5 Bloodveld slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.Bloodveld, 5);
		}
	},
	{
		id: 60,
		name: 'Complete 5 Dagannoth slayer tasks',
		has: async args => {
			return leaguesSlayerTaskForMonster(args, Monsters.Dagannoth, 5);
		}
	},
	{
		id: 62,
		name: 'Do a High gamble in Barb assault',
		has: async ({ mahojiUser }) => {
			return mahojiUser.high_gambles >= 1;
		}
	},
	{
		id: 63,
		name: 'Reach 5% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 5;
		}
	},
	{
		id: 64,
		name: 'Construct 500 objects',
		has: async ({ conStats }) => {
			return sumArr(conStats.items().map(i => i[1])) >= 500;
		}
	},
	{
		id: 65,
		name: 'Chop 250 of any logs',
		has: async ({ woodcuttingStats }) => {
			return sumArr(woodcuttingStats.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 66,
		name: 'Alch 250 of any item',
		has: async ({ alchingStats }) => {
			return sumArr(alchingStats.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 67,
		name: 'Clean 250 herbs',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.herbs.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 68,
		name: 'Mix 250 unf potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.unfPots.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 69,
		name: 'Mix 250 potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.pots.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 70,
		name: 'Mine 250 ores',
		has: async ({ miningStats }) => {
			return sumArr(miningStats.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 71,
		name: 'Burn 250 logs',
		has: async ({ firemakingStats }) => {
			return sumArr(firemakingStats.items().map(i => i[1])) >= 250;
		}
	},
	{
		id: 72,
		name: 'Smith items from 250 Bronze bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Bronze bar') >= 250;
		}
	},
	{
		id: 73,
		name: 'Cast 100 spells',
		has: async ({ spellCastingStats }) => {
			return sumArr(spellCastingStats.map(i => i.qty)) >= 100;
		}
	},
	{
		id: 74,
		name: 'Smith items from 50 Iron bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Iron bar') >= 50;
		}
	},
	{
		id: 75,
		name: 'Acquire, complete and open 100 Beginner clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (beginner)') >= 100;
		}
	},
	{
		id: 76,
		name: 'Acquire, complete and open 50 Easy clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (easy)') >= 50;
		}
	},
	{
		id: 77,
		name: 'Acquire, complete and open 20 Medium clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (medium)') >= 20;
		}
	},
	{
		id: 78,
		name: 'Acquire, complete and open 10 Hard clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (hard)') >= 10;
		}
	},
	{
		id: 79,
		name: 'Acquire, complete and open 5 Elite clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elite)') >= 5;
		}
	},
	{
		id: 80,
		name: 'Acquire, complete and open 2 Master clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (master)') >= 2;
		}
	},
	{
		id: 81,
		name: 'Acquire, complete and open 1 Grandmaster clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (grandmaster)') >= 1;
		}
	},
	{
		id: 82,
		name: 'Build and fill all beginner stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Beginner').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 83,
		name: 'Build and fill all easy stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Easy').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 84,
		name: 'Build and fill all medium stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Medium').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 85,
		name: 'Open the Crystal chest',
		has: async ({ opens }) => {
			return opens.has('Crystal key');
		}
	}
];
