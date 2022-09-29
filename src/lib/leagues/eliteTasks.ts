import { sumArr } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { feedableItems } from '../../mahoji/commands/tames';
import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import {
	abyssalDragonCL,
	all3rdAgeItems,
	customPetsCL,
	gracefulCL,
	ignecarusCL,
	kalphiteKingCL,
	kingGoldemarCL,
	nexCL,
	queenBlackDragonCL,
	seaKrakenCL,
	vasaMagusCL
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
import { TameSpeciesID, TameType } from '../tames';
import { ItemBank } from '../types';
import { calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, leaguesHasKC, Task } from './leaguesUtils';

export const eliteTasks: Task[] = [
	{
		id: 3000,
		name: 'Complete the Elite Wilderness diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WildernessDiary.elite))[0];
		}
	},
	{
		id: 3001,
		name: 'Complete the Elite Western Prov diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, WesternProv.elite))[0];
		}
	},
	{
		id: 3002,
		name: 'Complete the Elite Ardougne diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, ArdougneDiary.elite))[0];
		}
	},
	{
		id: 3003,
		name: 'Complete the Elite Desert diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, DesertDiary.elite))[0];
		}
	},
	{
		id: 3004,
		name: 'Complete the Elite Falador diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FaladorDiary.elite))[0];
		}
	},
	{
		id: 3005,
		name: 'Complete the Elite Fremennik diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, FremennikDiary.elite))[0];
		}
	},
	{
		id: 3006,
		name: 'Complete the Elite Kandarin diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KandarinDiary.elite))[0];
		}
	},
	{
		id: 3007,
		name: 'Complete the Elite Karamja diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KaramjaDiary.elite))[0];
		}
	},
	{
		id: 3008,
		name: 'Complete the Elite Kourend Kebos diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, KourendKebosDiary.elite))[0];
		}
	},
	{
		id: 3009,
		name: 'Complete the Elite Lumbridge/Draynor diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, LumbridgeDraynorDiary.elite))[0];
		}
	},
	{
		id: 3010,
		name: 'Complete the Elite Morytania diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, MorytaniaDiary.elite))[0];
		}
	},
	{
		id: 3011,
		name: 'Complete the Elite Varrock diary',
		has: async ({ user }) => {
			return (await userhasDiaryTier(user, VarrockDiary.elite))[0];
		}
	},
	{
		id: 3012,
		name: 'Smelt 300 Adamantite bars from scratch',
		has: async ({ smeltingStats }) => {
			return smeltingStats.amount('Adamantite bar') >= 300;
		}
	},
	{
		id: 3013,
		name: 'Complete 250 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 250;
		}
	},
	{
		id: 3015,
		name: 'Obtain 1000 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 1000;
		}
	},
	{
		id: 3017,
		name: 'Reach total level 2500',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2500;
		}
	},
	{
		id: 3018,
		name: 'Complete 300 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 300;
		}
	},
	{
		id: 3019,
		name: 'Defeat Wintertodt 1000 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 1000;
		}
	},
	{
		id: 3020,
		name: 'Catch 500 Black salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Black salamander', 500);
		}
	},
	{
		id: 3021,
		name: 'Mix 1500 Super attack potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(resolveItems(['Super attack (3)', 'Super attack (4)']).map(i => herbloreStats.pots.amount(i))) >=
				1500
			);
		}
	},
	{
		id: 3022,
		name: 'Mix 1500 Super strength potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Super strength (3)', 'Super strength (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 1500
			);
		}
	},
	{
		id: 3023,
		name: 'Mix 1500 Super defence potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Super defence (3)', 'Super defence (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 1500
			);
		}
	},
	{
		id: 3024,
		name: 'Mix 1500 Stamina potions.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 1500
			);
		}
	},
	{
		id: 3025,
		name: 'Mix 2500 Saradomin brews.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 2500
			);
		}
	},
	{
		id: 3027,
		name: 'Receive 3x 3rd age items',
		has: async ({ cl }) => {
			return all3rdAgeItems.filter(i => cl.has(i)).length >= 3;
		}
	},
	{
		id: 3028,
		name: 'Complete 250 games of Monkey Rumble',
		has: async ({ minigames }) => {
			return minigames.monkey_rumble >= 250;
		}
	},
	{
		id: 3029,
		name: 'Finish the QBD CL',
		has: async ({ cl }) => {
			return queenBlackDragonCL.every(c => cl.has(c));
		}
	},
	{
		id: 3030,
		name: 'Finish the Sea Kraken CL',
		has: async ({ cl }) => {
			return seaKrakenCL.every(c => cl.has(c));
		}
	},
	{
		id: 3031,
		name: 'Finish the Kalphite King CL',
		has: async ({ cl }) => {
			return kalphiteKingCL.every(c => cl.has(c));
		}
	},
	{
		id: 3032,
		name: 'Finish the Nex CL',
		has: async ({ cl }) => {
			return nexCL.every(c => cl.has(c));
		}
	},
	{
		id: 3033,
		name: 'Receive any 25 custom pets',
		has: async ({ cl }) => {
			return customPetsCL.filter(i => cl.has(i)).length >= 25;
		}
	},
	{
		id: 3034,
		name: 'Disassemble 250 unique items',
		has: async ({ disassembledItems }) => {
			return disassembledItems.length >= 250;
		}
	},
	{
		id: 3035,
		name: 'Achieve base level 100 stats',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 100);
		}
	},
	{
		id: 3036,
		name: 'Complete 100 Farming contracts',
		has: async ({ user }) => {
			const contract = getFarmingContractOfUser(user);
			return contract.contractsCompleted >= 100;
		}
	},
	{
		id: 3037,
		name: 'Complete 50 Item Contracts',
		has: async ({ mahojiUser }) => {
			return mahojiUser.total_item_contracts >= 50;
		}
	},
	{
		id: 3038,
		name: 'Achieve an Item Contract streak of 20',
		has: async ({ mahojiUser }) => {
			return mahojiUser.item_contract_streak >= 20;
		}
	},
	{
		id: 3039,
		name: 'Kill 150 unique monsters',
		has: async ({ mahojiUser }) => {
			return Object.keys(mahojiUser.monsterScores as ItemBank).length >= 150;
		}
	},
	{
		id: 3040,
		name: 'Slay 250 superior slayer creatures',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_superior_count >= 250;
		}
	},
	{
		id: 3041,
		name: 'Sacrifice 10b worth of items/GP',
		has: async ({ mahojiUser }) => {
			return mahojiUser.sacrificedValue >= 10_000_000_000;
		}
	},
	{
		id: 3042,
		name: 'Receive a dragon egg and hatch it',
		has: async ({ tames, cl }) => {
			return cl.has('Dragon egg') && tames.some(t => t.species_id === TameSpeciesID.Igne);
		}
	},
	{
		id: 3043,
		name: 'Receive a monkey egg and hatch it',
		has: async ({ tames, cl }) => {
			return cl.has('Monkey egg') && tames.some(t => t.species_id === TameSpeciesID.Monkey);
		}
	},
	{
		id: 3044,
		name: 'Feed a perk-item to your Igne tame',
		has: async ({ tames }) => {
			return tames
				.filter(t => t.species_id === TameSpeciesID.Igne)
				.some(t => {
					const fedItems = new Bank(t.fed_items as ItemBank);
					return feedableItems.some(
						i => i.tameSpeciesCanBeFedThis.includes(TameType.Combat) && fedItems.has(i.item.id)
					);
				});
		}
	},
	{
		id: 3045,
		name: 'Feed a perk-item to your Monkey tame',
		has: async ({ tames }) => {
			return tames
				.filter(t => t.species_id === TameSpeciesID.Monkey)
				.some(t => {
					const fedItems = new Bank(t.fed_items as ItemBank);
					return feedableItems.some(
						i => i.tameSpeciesCanBeFedThis.includes(TameType.Gatherer) && fedItems.has(i.item.id)
					);
				});
		}
	},
	{
		id: 3046,
		name: 'Make 100 Extraordinary kibble',
		has: async ({ cl }) => {
			return cl.amount('Extraordinary kibble') >= 100;
		}
	},
	{
		id: 3047,
		name: 'Open 1000x TMB',
		has: async ({ opens }) => {
			return opens.amount('Tradeable mystery box') >= 1000;
		}
	},
	{
		id: 3048,
		name: 'Open 1000x UMB',
		has: async ({ opens }) => {
			return opens.amount('Untradeable mystery box') >= 1000;
		}
	},
	{
		id: 3049,
		name: 'Open 100x EMB',
		has: async ({ opens }) => {
			return opens.amount('Equippable mystery box') >= 100;
		}
	},
	{
		id: 3050,
		name: 'Open 50x CMB',
		has: async ({ opens }) => {
			return opens.amount('Clothing mystery box') >= 50;
		}
	},
	{
		id: 3051,
		name: 'Open 50x HMB',
		has: async ({ opens }) => {
			return opens.amount('Holiday mystery box') >= 50;
		}
	},
	{
		id: 3052,
		name: 'Open 50x PMB',
		has: async ({ opens }) => {
			return opens.amount('Pet mystery box') >= 50;
		}
	},
	{
		id: 3053,
		name: 'Kill Zulrah 1000 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.Zulrah, 1000);
		}
	},
	{
		id: 3054,
		name: 'Kill the Corporeal Beast 1000 times',
		has: async args => {
			return leaguesHasKC(args, Monsters.CorporealBeast, 1000);
		}
	},
	{
		id: 3055,
		name: 'Defeat the Emerged Inferno',
		has: async ({ minigames }) => {
			return minigames.emerged_inferno >= 1;
		}
	},
	{
		id: 3056,
		name: 'Sacrifice 5b GP',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.amount('Coins') >= 5_000_000_000;
		}
	},
	{
		id: 3057,
		name: 'Sacrifice 250 different items',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.length >= 250;
		}
	},
	{
		id: 3058,
		name: 'Reach 60% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 60;
		}
	},
	{
		id: 3059,
		name: 'Construct 50,000 objects',
		has: async ({ conStats }) => {
			return sumArr(conStats.items().map(i => i[1])) >= 50_000;
		}
	},
	{
		id: 3060,
		name: 'Chop 50,000 of any logs',
		has: async ({ woodcuttingStats }) => {
			return sumArr(woodcuttingStats.items().map(i => i[1])) >= 50_000;
		}
	},
	{
		id: 3061,
		name: 'Alch 5000 of any item',
		has: async ({ alchingStats }) => {
			return sumArr(alchingStats.items().map(i => i[1])) >= 5000;
		}
	},
	{
		id: 3062,
		name: 'Clean 15,000 herbs',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.herbs.items().map(i => i[1])) >= 15_000;
		}
	},
	{
		id: 3063,
		name: 'Mix 15,000 unf potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.unfPots.items().map(i => i[1])) >= 15_000;
		}
	},
	{
		id: 3064,
		name: 'Mix 15,000 potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.pots.items().map(i => i[1])) >= 15_000;
		}
	},
	{
		id: 3065,
		name: 'Mine 25,000 ores',
		has: async ({ miningStats }) => {
			return sumArr(miningStats.items().map(i => i[1])) >= 25_000;
		}
	},
	{
		id: 3066,
		name: 'Burn 8000 logs',
		has: async ({ firemakingStats }) => {
			return sumArr(firemakingStats.items().map(i => i[1])) >= 8000;
		}
	},
	{
		id: 3067,
		name: 'Smith items from 50,000 Adamantite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Adamantite bar') >= 50_000;
		}
	},
	{
		id: 3068,
		name: 'Smith items from 30,000 Runite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Runite bar') >= 30_000;
		}
	},
	{
		id: 3069,
		name: 'Cast 10,000 spells',
		has: async ({ spellCastingStats }) => {
			return sumArr(spellCastingStats.map(i => i.qty)) >= 10_000;
		}
	},
	{
		id: 3070,
		name: 'Finish the graceful CL',
		has: async ({ cl }) => {
			return gracefulCL.every(i => cl.has(i));
		}
	},
	{
		id: 3071,
		name: 'Finish the Queen Black Dragon CL',
		has: async ({ cl }) => {
			return queenBlackDragonCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3072,
		name: 'Finish the Vasa Magus CL',
		has: async ({ cl }) => {
			return vasaMagusCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3073,
		name: 'Finish the Abyssal Dragon (Malygos) CL',
		has: async ({ cl }) => {
			return abyssalDragonCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3074,
		name: 'Finish the Kalphite King CL',
		has: async ({ cl }) => {
			return kalphiteKingCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3075,
		name: 'Finish the Ignecarus CL',
		has: async ({ cl }) => {
			return ignecarusCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3076,
		name: 'Finish the King Goldemar CL',
		has: async ({ cl }) => {
			return kingGoldemarCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 3077,
		name: 'Acquire, complete and open 500 Beginner clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (beginner)') >= 500;
		}
	},
	{
		id: 3078,
		name: 'Acquire, complete and open 500 Easy clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (easy)') >= 500;
		}
	},
	{
		id: 3079,
		name: 'Acquire, complete and open 300 Medium clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (medium)') >= 300;
		}
	},
	{
		id: 3080,
		name: 'Acquire, complete and open 300 Hard clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (hard)') >= 300;
		}
	},
	{
		id: 3081,
		name: 'Acquire, complete and open 500 Elite clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elite)') >= 300;
		}
	},
	{
		id: 3082,
		name: 'Acquire, complete and open 200 Master clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (master)') >= 200;
		}
	},
	{
		id: 3083,
		name: 'Acquire, complete and open 200 Grandmaster clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (grandmaster)') >= 200;
		}
	},
	{
		id: 3084,
		name: 'Create Drygore igne claws',
		has: async ({ cl }) => {
			return cl.has('Drygore igne claws');
		}
	},
	{
		id: 3085,
		name: 'Create Dwarven igne claws',
		has: async ({ cl }) => {
			return cl.has('Dwarven igne claws');
		}
	}
];
