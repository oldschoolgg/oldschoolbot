import { percentChance, reduceNumByPercent, roll, sumArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { LootBank } from 'oldschooljs/dist/meta/types';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { ItemBank } from '../types';
import { assert, convertLootBanksToItemBanks, JSONClone } from '../util';

export interface TeamMember {
	id: string;
	/**
	 * The rooms they died in.
	 */
	deaths: number[];
}

// const Rooms = [
// 	{
// 		name: 'Maiden'
// 	},
// 	{
// 		name: 'Bloat'
// 	},
// 	{
// 		name: 'Nylocas'
// 	},
// 	{
// 		name: 'Soteseteg'
// 	},
// 	{
// 		name: 'Xarps'
// 	},
// 	{
// 		name: 'Vitir Verizk'
// 	}
// ];

export interface TheatreOfBloodOptions {
	/**
	 * Whether or not this raid is in Challenge Mode or not.
	 */
	hardMode: boolean;
	/**
	 * The members of the raid team, 1-5 people.
	 */
	team: TeamMember[];
}

interface ParsedMember extends TeamMember {
	numDeaths: number;
	points: number;
}

const UniqueTable = new LootTable()
	.add('Scythe of vitur')
	.add('Ghrazi rapier', 2)
	.add('Sanguinesti staff', 2)
	.add('Justiciar faceguard', 2)
	.add('Justiciar chestguard', 2)
	.add('Justiciar legguards', 2)
	.add('Avernic defender hilt', 8);

const NonUniqueTable = new LootTable()
	.tertiary(25, 'Clue scroll (elite)')
	.add('Vial of blood', [50, 60], 2)
	.add('Death rune', [500, 600])
	.add('Blood rune', [500, 600])
	.add('Swamp tar', [500, 600])
	.add('Coal', [500, 600])
	.add('Gold ore', [300, 360])
	.add('Molten glass', [200, 240])
	.add('Adamantite ore', [130, 156])
	.add('Runite ore', [60, 72])
	.add('Wine of zamorak', [50, 60])
	.add('Potato cactus', [50, 60])
	.add('Grimy cadantine', [50, 60])
	.add('Grimy avantoe', [40, 48])
	.add('Grimy irit leaf', [34, 40])
	.add('Grimy ranarr weed', [30, 36])
	.add('Grimy snapdragon', [27, 32])
	.add('Grimy lantadyme', [26, 31])
	.add('Grimy dwarf weed', [24, 28])
	.add('Grimy torstol', [20, 24])

	.add('Battlestaff', [15, 18])
	.add('Mahogany seed', [8, 12])
	.add('Rune battleaxe', 4)
	.add('Rune platebody', 4)
	.add('Rune chainbody', 4)

	.add('Palm tree seed', 3)
	.add('Yew seed', 3)
	.add('Magic seed', 3);

const HardModeUniqueTable = new LootTable()
	.tertiary(300, 'Sanguine dust')
	.tertiary(150, 'Sanguine ornament kit')
	.tertiary(100, 'Holy ornament kit');

export class TheatreOfBloodClass {
	nonUniqueLoot(member: ParsedMember, isHardMode: boolean) {
		const loot = new Bank();
		for (let i = 0; i < 3; i++) {
			loot.add(NonUniqueTable.roll());
		}

		let petChance = 650;
		petChance *= member.numDeaths;
		if (roll(petChance)) {
			loot.add("Lil' zik");
		}

		if (isHardMode) {
			loot.add(HardModeUniqueTable.roll());
		}

		return loot;
	}

	public uniqueDecide(team: ParsedMember[]) {
		const table = new SimpleTable<ParsedMember>();
		for (const member of team) {
			table.add(member, member.points);
		}

		return table.roll().item;
	}

	public complete(_options: TheatreOfBloodOptions): {
		[key: string]: ItemBank;
	} {
		const options = JSONClone(_options);
		assert(options.team.length >= 1 || options.team.length <= 5, 'TOB team must have 1-5 members');

		const maxPointsPerPerson = 22;
		const penaltyForDeath = 4;
		const maxPointsTeamCanGet = options.team.length * maxPointsPerPerson;

		const parsedTeam: ParsedMember[] = _options.team.map(t => ({
			id: t.id,
			deaths: t.deaths,
			numDeaths: t.deaths.length,
			points: maxPointsPerPerson - t.deaths.length * penaltyForDeath
		}));

		const teamPoints = sumArr(parsedTeam.map(val => val.points));
		assert(teamPoints <= maxPointsTeamCanGet, 'Cannot exceed max points');

		const totalDeaths = sumArr(parsedTeam.map(i => i.numDeaths));

		let percentBaseChanceOfUnique = 11;
		for (let i = 0; i < totalDeaths; i++) {
			percentBaseChanceOfUnique = reduceNumByPercent(percentBaseChanceOfUnique, 13.35);
		}

		const purpleReceived = percentChance(percentBaseChanceOfUnique);
		const purpleRecipient = purpleReceived ? this.uniqueDecide(parsedTeam) : null;

		const lootResult: LootBank = {};

		for (const member of parsedTeam) {
			if (member === purpleRecipient) {
				lootResult[member.id] = new Bank().add(UniqueTable.roll());
			} else {
				lootResult[member.id] = this.nonUniqueLoot(member, options.hardMode);
			}
		}

		return convertLootBanksToItemBanks(lootResult);
	}
}

export const TheatreOfBlood = new TheatreOfBloodClass();
