import { sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { feedableItems } from '../../mahoji/commands/tames';
import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import {
	all3rdAgeItems,
	cluesHardCL,
	customPetsCL,
	kalphiteKingCL,
	nexCL,
	queenBlackDragonCL,
	seaKrakenCL
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
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { leaguesHasCatches, Task } from './leagues';

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
		name: 'Smith 100 Adamantite bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Adamantite ore') >= 100 && cl.amount('Adamant bar') >= 100;
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
		id: 3014,
		name: 'Do 50 laps at the Pollnivneach Course',
		has: async ({ lapScores }) => {
			return (lapScores[9] ?? 0) >= 50;
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
		id: 3016,
		name: 'Reach combat level 110',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 110;
		}
	},
	{
		id: 3017,
		name: 'Reach total level 2000',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2000;
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
		name: 'Catch 200 Black salamanders',
		has: async args => {
			return leaguesHasCatches(args, 'Red salamander', 200);
		}
	},
	{
		id: 3021,
		name: 'Mix 500 Super attack potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super attack potion (3)', 'Super attack potion (4)']).map(i => cl.amount(i))) >=
				500
			);
		}
	},
	{
		id: 3022,
		name: 'Mix 500 Super strength potions.',
		has: async ({ cl }) => {
			return (
				sumArr(
					resolveItems(['Super strength potion (3)', 'Super strength potion (4)']).map(i => cl.amount(i))
				) >= 500
			);
		}
	},
	{
		id: 3023,
		name: 'Mix 500 Super defence potions.',
		has: async ({ cl }) => {
			return (
				sumArr(resolveItems(['Super defence potion (3)', 'Super defence potion (4)']).map(i => cl.amount(i))) >=
				500
			);
		}
	},
	{
		id: 3024,
		name: 'Mix 500 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 500;
		}
	},
	{
		id: 3025,
		name: 'Mix 2000 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 2000;
		}
	},
	{
		id: 3026,
		name: 'Finish the hard clue CL',
		has: async ({ cl }) => {
			return cluesHardCL.filter(i => cl.has(i)).length === cluesHardCL.length;
		}
	},
	{
		id: 3027,
		name: 'Receive 3 3rd age items',
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
		has: async ({ mahojiUser }) => {
			const contract = getFarmingContractOfUser(mahojiUser);
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
	}
];
