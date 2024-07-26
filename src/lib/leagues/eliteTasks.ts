import { sumArr } from 'e';
import { Bank, Monsters, Openables } from 'oldschooljs';

import { eggs } from '../../mahoji/commands/offer';
import { ZALCANO_ID } from '../constants';
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
	spectatorClothes,
	troubleBrewingCL,
	vasaMagusCL
} from '../data/CollectionsExport';
import { slayerMaskHelms } from '../data/slayerMaskHelms';
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
	VarrockDiary,
	WesternProv,
	WildernessDiary,
	userhasDiaryTier
} from '../diaries';
import { implings } from '../implings';
import { SunMoonMonsters } from '../minions/data/killableMonsters/custom/SunMoon';
import { Naxxus } from '../minions/data/killableMonsters/custom/bosses/Naxxus';
import Darts from '../skilling/skills/fletching/fletchables/darts';
import Javelins from '../skilling/skills/fletching/fletchables/javelins';
import { ashes } from '../skilling/skills/prayer';
import { TameSpeciesID, tameFeedableItems } from '../tames';
import type { ItemBank } from '../types';
import { calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { type Task, leaguesHasCatches, leaguesHasKC } from './leaguesUtils';
import { calculateTiarasMade } from './stats';

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
			const contract = user.farmingContract();
			return contract.contract.contractsCompleted >= 100;
		}
	},
	{
		id: 3039,
		name: 'Kill 150 unique monsters',
		has: async ({ userStats }) => {
			return Object.keys(userStats.monster_scores as ItemBank).length >= 150;
		}
	},
	{
		id: 3040,
		name: 'Slay 250 superior slayer creatures',
		has: async ({ userStats }) => {
			return userStats.slayer_superior_count >= 250;
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
					return tameFeedableItems.some(
						i => i.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Igne) && fedItems.has(i.item.id)
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
					return tameFeedableItems.some(
						i => i.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Monkey) && fedItems.has(i.item.id)
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
			return actualClues.amount('Clue scroll (elite)') >= 500;
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
	},
	{
		id: 3086,
		name: 'Receive 1,000,000 XP from silverhawk boots',
		has: async ({ userStats }) => {
			return userStats.silverhawk_boots_passive_xp >= 1_000_000;
		}
	},
	{
		id: 3087,
		name: 'Tan 20,000 hides with the portable tanner',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.portable_tanner_bank as ItemBank)) >= 20_000;
		}
	},
	{
		id: 3088,
		name: 'Upgrade 500 clues with the clue upgrader',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.clue_upgrader_bank as ItemBank)) >= 500;
		}
	},
	{
		id: 3089,
		name: 'Scatter 1000 of every ashes',
		has: async ({ userStats }) => {
			const vals = Object.values(userStats.scattered_ashes_bank as ItemBank);
			return vals.length === ashes.length && vals.every(i => i >= 1000);
		}
	},
	{
		id: 3090,
		name: 'Receive 10,000 bars from an adze',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.bars_from_adze_bank as ItemBank)) >= 10_000;
		}
	},
	{
		id: 3091,
		name: 'Offer 100 of each bird egg',
		has: async ({ userStats }) => {
			const vals = Object.values(userStats.bird_eggs_offered_bank as ItemBank);
			return vals.length === eggs.length && vals.every(i => Number(i) >= 100);
		}
	},
	{
		id: 3092,
		name: 'Receive 5000 ores from ore spirits',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.ores_from_spirits_bank as ItemBank)) >= 5000;
		}
	},
	{
		id: 3093,
		name: 'Kill Naxxus 300 times',
		has: async args => {
			return leaguesHasKC(args, Naxxus, 300);
		}
	},
	{
		id: 3094,
		name: 'Catch 30 of every impling passively (excluding lucky implings)',
		has: async ({ userStats }) => {
			const loot = new Bank(userStats.passive_implings_bank as ItemBank);
			for (const implingId of Object.keys(implings)) {
				if (Number(implingId) !== Openables.LuckyImpling.id && loot.amount(Number(implingId)) < 30) {
					return false;
				}
			}
			return true;
		}
	},
	{
		id: 3095,
		name: 'Open the Crystal chest 1000 times',
		has: async ({ opens }) => {
			return opens.amount('Crystal key') >= 1000;
		}
	},
	{
		id: 3096,
		name: 'Receive and use a deathtouched dart',
		has: async ({ cl, userStats }) => {
			return cl.has('Deathtouched dart') && userStats.death_touched_darts_used >= 1;
		}
	},
	{
		id: 3097,
		name: 'Fletch 200,000 javelins',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Javelins) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 200_000;
		}
	},
	{
		id: 3098,
		name: 'Fletch 1,000,000 darts',
		has: async ({ fletchedItems }) => {
			let total = 0;
			for (const item of Darts) {
				total += fletchedItems.amount(item.id);
			}
			return total >= 1_000_000;
		}
	},
	{
		id: 3099,
		name: 'Receive, and alch, 50x Magical artifacts',
		has: async ({ user, alchingStats }) => {
			return user.cl.amount('Magical artifact') >= 50 && alchingStats.amount('Magical artifact') >= 50;
		}
	},
	{
		id: 3100,
		name: 'Runecraft 10,000 Tiaras',
		has: async ({ user }) => {
			const tiarasMade = await calculateTiarasMade(user);
			return sumArr(tiarasMade.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 3101,
		name: 'Receive all Balthazars Big Bonanza spectator clothes',
		has: async ({ user }) => {
			return spectatorClothes.every(i => user.cl.has(i));
		}
	},
	{
		id: 3102,
		name: 'Complete the Trouble Brewing CL',
		has: async ({ user }) => {
			return troubleBrewingCL.every(i => user.cl.has(i));
		}
	},
	{
		id: 3103,
		name: 'Defeat Zalcano 1000 times',
		has: async args => {
			return leaguesHasKC(args, { id: ZALCANO_ID }, 1000);
		}
	},
	{
		id: 3104,
		name: 'Obtain all Custom Slayer masks',
		has: async ({ user }) => {
			return slayerMaskHelms.every(mask => user.cl.has(mask.mask.id));
		}
	},
	{
		id: 3105,
		name: 'Receive a eagle egg and hatch it',
		has: async ({ tames, cl }) => {
			return cl.has('Eagle egg') && tames.some(t => t.species_id === TameSpeciesID.Eagle);
		}
	},
	{
		id: 3106,
		name: 'Feed a perk-item to your Eagle tame',
		has: async ({ tames }) => {
			return tames
				.filter(t => t.species_id === TameSpeciesID.Eagle)
				.some(t => {
					const fedItems = new Bank(t.fed_items as ItemBank);
					return tameFeedableItems.some(
						i => i.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Eagle) && fedItems.has(i.item.id)
					);
				});
		}
	},
	{
		id: 3107,
		name: 'Create a Divine ring',
		has: async ({ cl }) => {
			return cl.has('Divine ring');
		}
	},
	{
		id: 3108,
		name: 'Create any set of eagle jibwings',
		has: async ({ cl }) => {
			return [
				'Abyssal jibwings (e)',
				'Demonic jibwings (e)',
				'3rd age jibwings (e)',
				'Abyssal jibwings',
				'Demonic jibwings',
				'3rd age jibwings'
			].some(i => cl.has(i));
		}
	},
	{
		id: 3109,
		name: 'Create any set of enhanced eagle jibwings',
		has: async ({ cl }) => {
			return ['Abyssal jibwings (e)', 'Demonic jibwings (e)', '3rd age jibwings (e)'].some(i => cl.has(i));
		}
	},
	{
		id: 3110,
		name: 'Kill Solis',
		has: async ({ monsterScores }) => {
			return Boolean(monsterScores[SunMoonMonsters.Solis.id]);
		}
	},
	{
		id: 3111,
		name: 'Create an Axe of the high sungod',
		has: async ({ cl }) => {
			return cl.has('Axe of the high sungod');
		}
	},
	{
		id: 3112,
		name: 'Acquire, complete and open 100 Elder clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elder)') >= 100;
		}
	}
];
