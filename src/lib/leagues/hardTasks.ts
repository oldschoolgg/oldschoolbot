import { sumArr } from 'e';
import { Bank, Monsters, Openables } from 'oldschooljs';

import { eggs } from '../../mahoji/commands/offer';
import { circusBuyables } from '../data/buyables/circusBuyables';
import { fistOfGuthixBuyables } from '../data/buyables/fistOfGuthixBuyables';
import { stealingCreationBuyables } from '../data/buyables/stealingCreationBuyables';
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
import { dyedItems } from '../dyedItems';
import { implings } from '../implings';
import { Inventions } from '../invention/inventions';
import { MOKTANG_ID } from '../minions/data/killableMonsters/custom/bosses/Moktang';
import { Naxxus } from '../minions/data/killableMonsters/custom/bosses/Naxxus';
import { NexMonster } from '../nex';
import { allThirdAgeItems } from '../simulation/sharedTables';
import Darts from '../skilling/skills/fletching/fletchables/darts';
import Javelins from '../skilling/skills/fletching/fletchables/javelins';
import { ashes } from '../skilling/skills/prayer';
import { ItemBank } from '../types';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, leaguesHasKC, Task } from './leaguesUtils';
import { calculateChargedItems, calculateTiarasMade } from './stats';

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
		name: 'Smelt 100 Mithril bars from scratch',
		has: async ({ smeltingStats }) => {
			return smeltingStats.amount('Mithril bar') >= 100;
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
		name: 'Reach combat level 126',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 126;
		}
	},
	{
		id: 2019,
		name: 'Reach total level 2000',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2000;
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
		name: 'Complete 50 Castle Wars games',
		has: async ({ minigames }) => {
			return minigames.castle_wars >= 50;
		}
	},
	{
		id: 2025,
		name: 'Complete 250 Temple Treks',
		has: async ({ minigames }) => {
			return minigames.temple_trekking >= 250;
		}
	},
	{
		id: 2026,
		name: 'Complete 150 Last Man Standing games',
		has: async ({ minigames }) => {
			return minigames.lms >= 150;
		}
	},
	{
		id: 2028,
		name: 'Catch 500 Red salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Red salamander', 500);
		}
	},
	{
		id: 2029,
		name: 'Mix 1000 Prayer potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Prayer potion (3)', 'Prayer potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 1000
			);
		}
	},
	{
		id: 2030,
		name: 'Mix 500 Super attack potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(resolveItems(['Super attack (3)', 'Super attack (4)']).map(i => herbloreStats.pots.amount(i))) >=
				500
			);
		}
	},
	{
		id: 2031,
		name: 'Mix 500 Super strength potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Super strength (3)', 'Super strength (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
		}
	},
	{
		id: 2032,
		name: 'Mix 500 Super defence potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Super defence (3)', 'Super defence (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
		}
	},
	{
		id: 2033,
		name: 'Mix 500 Ranging potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Ranging potion (3)', 'Ranging potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
		}
	},
	{
		id: 2034,
		name: 'Mix 500 Magic potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(resolveItems(['Magic potion (3)', 'Magic potion (4)']).map(i => herbloreStats.pots.amount(i))) >=
				500
			);
		}
	},
	{
		id: 2035,
		name: 'Mix 500 Stamina potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
		}
	},
	{
		id: 2036,
		name: 'Mix 500 Saradomin brews.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 500
			);
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
		name: 'Defeat 50 Obor',
		has: async args => {
			return leaguesHasKC(args, Monsters.Obor, 50);
		}
	},
	{
		id: 2043,
		name: 'Defeat 50 Bryophyta',
		has: async args => {
			return leaguesHasKC(args, Monsters.Bryophyta, 50);
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
		name: 'Mix 250 Heat res. brews from scratch',
		has: async ({ cl, herbloreStats, skillsLevels }) => {
			return (
				skillsLevels.farming >= 99 &&
				skillsLevels.herblore >= 110 &&
				cl.amount('Athelas seed') >= 3 &&
				cl.amount('Athelas') >= 100 &&
				cl.amount('Heat res. vial') >= 250 &&
				herbloreStats.pots.amount('Heat res. brew') >= 250
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
			return resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire', 'Phoenix eggling']).every(i =>
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
	},
	{
		id: 2059,
		name: 'Complete 50 Farming contracts',
		has: async ({ user }) => {
			const contract = user.farmingContract();
			return contract.contract.contractsCompleted >= 50;
		}
	},
	{
		id: 2060,
		name: 'Complete 30 Item Contracts',
		has: async ({ mahojiUser }) => {
			return mahojiUser.total_item_contracts >= 30;
		}
	},
	{
		id: 2061,
		name: 'Achieve an Item Contract streak of 15',
		has: async ({ mahojiUser }) => {
			return mahojiUser.item_contract_streak >= 15;
		}
	},
	{
		id: 2062,
		name: 'Kill 75 unique monsters',
		has: async ({ userStats }) => {
			return Object.keys(userStats.monster_scores as ItemBank).length >= 75;
		}
	},
	{
		id: 2063,
		name: 'Slay 50 superior slayer creatures',
		has: async ({ userStats }) => {
			return userStats.slayer_superior_count >= 50;
		}
	},
	{
		id: 2064,
		name: 'Sacrifice 3b worth of items/GP',
		has: async ({ mahojiUser }) => {
			return mahojiUser.sacrificedValue >= 3_000_000_000;
		}
	},
	{
		id: 2065,
		name: 'Complete the Corrupted Gauntlet',
		has: async ({ minigames }) => {
			return minigames.corrupted_gauntlet >= 1;
		}
	},
	{
		id: 2066,
		name: 'Complete the Corrupted Gauntlet 100 times',
		has: async ({ minigames }) => {
			return minigames.corrupted_gauntlet >= 100;
		}
	},
	{
		id: 2067,
		name: 'Unlock every invention blueprint',
		has: async ({ mahojiUser }) => {
			return mahojiUser.unlocked_blueprints.length >= Inventions.length;
		}
	},
	{
		id: 2068,
		name: 'Dye an item',
		has: async ({ cl }) => {
			return dyedItems
				.map(i => i.dyedVersions)
				.flat(2)
				.some(i => cl.has(i.item.id));
		}
	},
	{
		id: 2069,
		name: 'Achieve level 120 Agility',
		has: async ({ skillsLevels }) => {
			return skillsLevels.agility >= 120;
		}
	},
	{
		id: 2070,
		name: 'Achieve level 120 Cooking',
		has: async ({ skillsLevels }) => {
			return skillsLevels.cooking >= 120;
		}
	},
	{
		id: 2071,
		name: 'Achieve level 120 Fishing',
		has: async ({ skillsLevels }) => {
			return skillsLevels.fishing >= 120;
		}
	},
	{
		id: 2072,
		name: 'Achieve level 120 Mining',
		has: async ({ skillsLevels }) => {
			return skillsLevels.mining >= 120;
		}
	},
	{
		id: 2073,
		name: 'Achieve level 120 Smithing',
		has: async ({ skillsLevels }) => {
			return skillsLevels.smithing >= 120;
		}
	},
	{
		id: 2074,
		name: 'Achieve level 120 Woodcutting',
		has: async ({ skillsLevels }) => {
			return skillsLevels.woodcutting >= 120;
		}
	},
	{
		id: 2075,
		name: 'Achieve level 120 Firemaking',
		has: async ({ skillsLevels }) => {
			return skillsLevels.firemaking >= 120;
		}
	},
	{
		id: 2076,
		name: 'Achieve level 120 Runecraft',
		has: async ({ skillsLevels }) => {
			return skillsLevels.runecraft >= 120;
		}
	},
	{
		id: 2077,
		name: 'Achieve level 120 Crafting',
		has: async ({ skillsLevels }) => {
			return skillsLevels.crafting >= 120;
		}
	},
	{
		id: 2078,
		name: 'Achieve level 120 Prayer',
		has: async ({ skillsLevels }) => {
			return skillsLevels.prayer >= 120;
		}
	},
	{
		id: 2079,
		name: 'Achieve level 120 Fletching',
		has: async ({ skillsLevels }) => {
			return skillsLevels.fletching >= 120;
		}
	},
	{
		id: 2080,
		name: 'Achieve level 120 Farming',
		has: async ({ skillsLevels }) => {
			return skillsLevels.farming >= 120;
		}
	},
	{
		id: 2081,
		name: 'Achieve level 120 Herblore',
		has: async ({ skillsLevels }) => {
			return skillsLevels.herblore >= 120;
		}
	},
	{
		id: 2083,
		name: 'Achieve level 120 Thieving',
		has: async ({ skillsLevels }) => {
			return skillsLevels.thieving >= 120;
		}
	},
	{
		id: 2084,
		name: 'Achieve level 120 Hunter',
		has: async ({ skillsLevels }) => {
			return skillsLevels.hunter >= 120;
		}
	},
	{
		id: 2085,
		name: 'Achieve level 120 Construction',
		has: async ({ skillsLevels }) => {
			return skillsLevels.construction >= 120;
		}
	},
	{
		id: 2086,
		name: 'Achieve level 120 Magic',
		has: async ({ skillsLevels }) => {
			return skillsLevels.magic >= 120;
		}
	},
	{
		id: 2087,
		name: 'Achieve level 120 Attack',
		has: async ({ skillsLevels }) => {
			return skillsLevels.attack >= 120;
		}
	},
	{
		id: 2088,
		name: 'Achieve level 120 Strength',
		has: async ({ skillsLevels }) => {
			return skillsLevels.strength >= 120;
		}
	},
	{
		id: 2089,
		name: 'Achieve level 120 Defence',
		has: async ({ skillsLevels }) => {
			return skillsLevels.defence >= 120;
		}
	},
	{
		id: 2090,
		name: 'Achieve level 120 Ranged',
		has: async ({ skillsLevels }) => {
			return skillsLevels.ranged >= 120;
		}
	},
	{
		id: 2091,
		name: 'Achieve level 120 Hitpoints',
		has: async ({ skillsLevels }) => {
			return skillsLevels.hitpoints >= 120;
		}
	},
	{
		id: 2092,
		name: 'Achieve level 120 Dungeoneering',
		has: async ({ skillsLevels }) => {
			return skillsLevels.dungeoneering >= 120;
		}
	},
	{
		id: 2093,
		name: 'Achieve level 120 Slayer',
		has: async ({ skillsLevels }) => {
			return skillsLevels.slayer >= 120;
		}
	},
	{
		id: 2094,
		name: 'Achieve level 120 Invention',
		has: async ({ skillsLevels }) => {
			return skillsLevels.invention >= 120;
		}
	},
	{
		id: 2095,
		name: 'Make 100 Delicious kibble',
		has: async ({ cl }) => {
			return cl.amount('Delicious kibble') >= 100;
		}
	},
	{
		id: 2096,
		name: 'Receive a Zippy',
		has: async ({ cl }) => {
			return cl.has('Zippy');
		}
	},
	{
		id: 2097,
		name: 'Open 250x TMB',
		has: async ({ opens }) => {
			return opens.amount('Tradeable mystery box') >= 250;
		}
	},
	{
		id: 2098,
		name: 'Open 250x UMB',
		has: async ({ opens }) => {
			return opens.amount('Untradeable mystery box') >= 250;
		}
	},
	{
		id: 2099,
		name: 'Open 50x EMB',
		has: async ({ opens }) => {
			return opens.amount('Equippable mystery box') >= 50;
		}
	},
	{
		id: 2100,
		name: 'Open 25x CMB',
		has: async ({ opens }) => {
			return opens.amount('Clothing mystery box') >= 25;
		}
	},
	{
		id: 2101,
		name: 'Open 20x HMB',
		has: async ({ opens }) => {
			return opens.amount('Holiday mystery box') >= 20;
		}
	},
	{
		id: 2102,
		name: 'Open 20x PMB',
		has: async ({ opens }) => {
			return opens.amount('Pet mystery box') >= 20;
		}
	},
	{
		id: 2103,
		name: 'Kill every Godwars Dungeon Boss 250 times',
		has: async args => {
			return [
				Monsters.GeneralGraardor,
				Monsters.CommanderZilyana,
				Monsters.KrilTsutsaroth,
				Monsters.Kreearra
			].every(mon => leaguesHasKC(args, mon, 250));
		}
	},
	{
		id: 2104,
		name: 'Kill Zulrah 100 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Zulrah, 100);
		}
	},
	{
		id: 2105,
		name: 'Kill the Corporeal Beast 250 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.CorporealBeast, 250);
		}
	},
	{
		id: 2106,
		name: 'Kill Hespori 100 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Hespori, 100);
		}
	},
	{
		id: 2107,
		name: 'Defeat the Inferno',
		has: async ({ minigames }) => {
			return minigames.inferno >= 1;
		}
	},
	{
		id: 2108,
		name: 'Fletch 5000 Dragon arrows',
		has: async ({ cl }) => {
			return ['Dragon arrow', 'Headless arrow', 'Dragon arrowtips'].every(i => cl.amount(i) >= 5000);
		}
	},
	{
		id: 2109,
		name: 'Catch 10 Lucky implings',
		has: async ({ cl }) => {
			return cl.amount('Lucky impling jar') >= 10;
		}
	},
	{
		id: 2110,
		name: 'Sacrifice 2b GP',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.amount('Coins') >= 2_000_000_000;
		}
	},
	{
		id: 2111,
		name: 'Sacrifice any third age item',
		has: async ({ sacrificedBank }) => {
			return allThirdAgeItems.some(i => sacrificedBank.has(i));
		}
	},
	{
		id: 2112,
		name: 'Sacrifice 100 different items',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.length >= 100;
		}
	},
	{
		id: 2113,
		name: 'Do 50 High gambles in Barb assault',
		has: async ({ userStats }) => {
			return userStats.high_gambles >= 50;
		}
	},
	{
		id: 2114,
		name: 'Reach 35% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 35;
		}
	},
	{
		id: 2115,
		name: 'Construct 25,000 objects',
		has: async ({ conStats }) => {
			return sumArr(conStats.items().map(i => i[1])) >= 25_000;
		}
	},
	{
		id: 2116,
		name: 'Chop 10,000 of any logs',
		has: async ({ woodcuttingStats }) => {
			return sumArr(woodcuttingStats.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 2117,
		name: 'Alch 5000 of any item',
		has: async ({ alchingStats }) => {
			return sumArr(alchingStats.items().map(i => i[1])) >= 5000;
		}
	},
	{
		id: 2118,
		name: 'Clean 10,000 herbs',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.herbs.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 2119,
		name: 'Mix 10,000 unf potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.unfPots.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 2120,
		name: 'Mix 5000 potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.pots.items().map(i => i[1])) >= 5000;
		}
	},
	{
		id: 2121,
		name: 'Mine 10,000 ores',
		has: async ({ miningStats }) => {
			return sumArr(miningStats.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 2122,
		name: 'Burn 3500 logs',
		has: async ({ firemakingStats }) => {
			return sumArr(firemakingStats.items().map(i => i[1])) >= 3500;
		}
	},
	{
		id: 2123,
		name: 'Smith items from 20,000 Mithril bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Mithril bar') >= 20_000;
		}
	},
	{
		id: 2125,
		name: 'Smith items from 15,000 Adamantite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Adamantite bar') >= 15_000;
		}
	},
	{
		id: 2126,
		name: 'Smith items from 10,000 Runite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Runite bar') >= 10_000;
		}
	},
	{
		id: 2128,
		name: 'Cast 5000 spells',
		has: async ({ spellCastingStats }) => {
			return sumArr(spellCastingStats.map(i => i.qty)) >= 5000;
		}
	},
	{
		id: 2129,
		name: 'Defeat Nex 500 Times',
		has: async ({ monsterScores }) => {
			return (monsterScores[NexMonster.id] ?? 0) >= 500;
		}
	},
	{
		id: 2131,
		name: 'Acquire, complete and open 250 Beginner clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (beginner)') >= 250;
		}
	},
	{
		id: 2132,
		name: 'Acquire, complete and open 250 Easy clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (easy)') >= 250;
		}
	},
	{
		id: 2133,
		name: 'Acquire, complete and open 250 Medium clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (medium)') >= 250;
		}
	},
	{
		id: 2134,
		name: 'Acquire, complete and open 250 Hard clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (hard)') >= 250;
		}
	},
	{
		id: 2135,
		name: 'Acquire, complete and open 250 Elite clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elite)') >= 250;
		}
	},
	{
		id: 2136,
		name: 'Acquire, complete and open 50 Master clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (master)') >= 50;
		}
	},
	{
		id: 2137,
		name: 'Acquire, complete and open 30 Grandmaster clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (grandmaster)') >= 30;
		}
	},
	{
		id: 2138,
		name: 'Mix 250 Heat res. restore from scratch',
		has: async ({ cl, herbloreStats, skillsLevels }) => {
			return (
				skillsLevels.farming >= 99 &&
				skillsLevels.herblore >= 110 &&
				cl.amount('Athelas seed') >= 3 &&
				cl.amount('Athelas') >= 100 &&
				cl.amount('Heat res. vial') >= 250 &&
				herbloreStats.pots.amount('Heat res. restore') >= 250
			);
		}
	},
	{
		id: 2139,
		name: 'Build and fill all master stash units',
		has: async ({ stashUnits }) => {
			return stashUnits.filter(i => i.tier.tier === 'Master').every(i => i.isFull && Boolean(i.builtUnit));
		}
	},
	{
		id: 2140,
		name: 'Kill Moktang',
		has: async args => {
			return leaguesHasKC(args, { id: MOKTANG_ID }, 1);
		}
	},
	{
		id: 2141,
		name: 'Create a mainhand and offhand Volcanic pickaxe',
		has: async ({ cl }) => {
			return cl.has('Volcanic pickaxe') && cl.has('Offhand volcanic pickaxe');
		}
	},
	{
		id: 2142,
		name: 'Create Volcanic igne claws',
		has: async ({ cl }) => {
			return cl.has('Volcanic igne claws');
		}
	},
	{
		id: 2143,
		name: 'Receive 100,000 Prayer XP from the ash sanctifier',
		has: async ({ userStats }) => {
			return userStats.ash_sanctifier_prayer_xp >= 100_000;
		}
	},
	{
		id: 2144,
		name: 'Receive 500,000 XP from silverhawk boots',
		has: async ({ userStats }) => {
			return userStats.silverhawk_boots_passive_xp >= 500_000;
		}
	},
	{
		id: 2146,
		name: 'Upgrade 100 clues with the clue upgrader',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.clue_upgrader_bank as ItemBank)) >= 100;
		}
	},
	{
		id: 2147,
		name: 'Tan 10,000 hides with the portable tanner',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.portable_tanner_bank as ItemBank)) >= 10_000;
		}
	},
	{
		id: 2148,
		name: 'Scatter 500 of every ashes',
		has: async ({ userStats }) => {
			let vals = Object.values(userStats.scattered_ashes_bank as ItemBank);
			return vals.length === ashes.length && vals.every(i => i >= 500);
		}
	},
	{
		id: 2149,
		name: 'Receive 5000 bars from an adze',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.bars_from_adze_bank as ItemBank)) >= 5000;
		}
	},
	{
		id: 2150,
		name: 'Offer 25 of each bird egg',
		has: async ({ userStats }) => {
			let vals = Object.values(userStats.bird_eggs_offered_bank as ItemBank);
			return vals.length === eggs.length && vals.every(i => Number(i) >= 25);
		}
	},
	{
		id: 2151,
		name: 'Receive 1000 ores from ore spirits',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.ores_from_spirits_bank as ItemBank)) >= 1000;
		}
	},
	{
		id: 2152,
		name: 'Kill Naxxus 10 times',
		has: async args => {
			return leaguesHasKC(args, Naxxus, 10);
		}
	},
	{
		id: 2153,
		name: 'Catch 20 of every impling passively (excluding Lucky implings)',
		has: async ({ userStats }) => {
			let loot = new Bank(userStats.passive_implings_bank as ItemBank);
			for (const implingId of Object.keys(implings)) {
				if (Number(implingId) !== Openables.LuckyImpling.id && loot.amount(Number(implingId)) < 20) {
					return false;
				}
			}
			return true;
		}
	},
	{
		id: 2154,
		name: 'Smelt 5000 bars with Klik',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.bars_from_klik_bank as ItemBank)) >= 5000;
		}
	},
	{
		id: 2155,
		name: 'Open the Crystal chest 250 times',
		has: async ({ opens }) => {
			return opens.amount('Crystal key') >= 250;
		}
	},
	{
		id: 2156,
		name: 'Fletch 50,000 javelins',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Javelins) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 50_000;
		}
	},
	{
		id: 2157,
		name: 'Fletch 500,000 darts',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Darts) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 500_000;
		}
	},
	{
		id: 2158,
		name: 'Charge 2500x Ring of wealth',
		has: async ({ user }) => {
			const { wealthCharged } = await calculateChargedItems(user);
			return wealthCharged >= 2500;
		}
	},
	{
		id: 2159,
		name: 'Charge 2500x Amulet of glory',
		has: async ({ user }) => {
			const { gloriesCharged } = await calculateChargedItems(user);
			return gloriesCharged >= 2500;
		}
	},
	{
		id: 2160,
		name: 'Receive, and alch, 10x Magical artifacts',
		has: async ({ user, alchingStats }) => {
			return user.cl.amount('Magical artifact') >= 10 && alchingStats.amount('Magical artifact') >= 10;
		}
	},
	{
		id: 2161,
		name: 'Runecraft 5000 Tiaras',
		has: async ({ user }) => {
			const tiarasMade = await calculateTiarasMade(user);
			return sumArr(tiarasMade.items().map(i => i[1])) >= 5000;
		}
	},
	{
		id: 2162,
		name: 'Buy all Fist of guthix rewards',
		has: async ({ user }) => {
			return fistOfGuthixBuyables.every(buyable => user.cl.has(buyable.name));
		}
	},
	{
		id: 2163,
		name: 'Buy all Stealing creation rewards',
		has: async ({ user }) => {
			return stealingCreationBuyables.every(buyable =>
				user.cl.has(buyable.outputItems === undefined ? buyable.name : (buyable.outputItems as Bank))
			);
		}
	},
	{
		id: 2164,
		name: 'Buy all Balthazars Big Bonanza rewards',
		has: async ({ user }) => {
			return circusBuyables.every(buyable => user.cl.has(buyable.name));
		}
	},
	{
		id: 2165,
		name: 'Create a Mangobeak from scratch',
		has: async ({ user }) => {
			return (
				(user.cl.has('Mangobeak') || user.owns('Mangobeak')) &&
				user.cl.has('Blabberbeak') &&
				(user.cl.has('Magical mango') || (user.cl.has('Shiny mango') && user.cl.has('Magus scroll')))
			);
		}
	},
	{
		id: 2166,
		name: 'Fletch 1000 Dragon javelins',
		has: async ({ fletchedItems }) => {
			return fletchedItems.amount('Dragon javelin') >= 1000;
		}
	}
];
