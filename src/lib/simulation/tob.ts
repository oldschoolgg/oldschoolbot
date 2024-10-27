import { SimpleTable } from '@oldschoolgg/toolkit/structures';
import { percentChance, roll, sumArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import type { LootBank } from 'oldschooljs/dist/meta/types';
import { JSONClone } from 'oldschooljs/dist/util';

import { TOBRooms } from '../data/tob';
import { assert } from '../util/logError';

interface TeamMember {
	id: string;
	/**
	 * The rooms they died in.
	 */
	deaths: number[];
}

interface TheatreOfBloodOptions {
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
	.add('Scythe of vitur (uncharged)')
	.add('Ghrazi rapier', 1, 2)
	.add('Sanguinesti staff (uncharged)', 1, 2)
	.add('Justiciar faceguard', 1, 2)
	.add('Justiciar chestguard', 1, 2)
	.add('Justiciar legguards', 1, 2)
	.add('Avernic defender hilt', 1, 8);

const HardModeUniqueTable = new LootTable()
	.add('Scythe of vitur (uncharged)')
	.add('Ghrazi rapier', 1, 2)
	.add('Sanguinesti staff (uncharged)', 1, 2)
	.add('Justiciar faceguard', 1, 2)
	.add('Justiciar chestguard', 1, 2)
	.add('Justiciar legguards', 1, 2)
	.add('Avernic defender hilt', 1, 7);

const NonUniqueTable = new LootTable()
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
	.add('Grimy toadflax', [37, 44])
	.add('Grimy kwuarm', [36, 43])
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

const HardModeExtraTable = new LootTable()
	.tertiary(275, 'Sanguine dust')
	.tertiary(150, 'Sanguine ornament kit')
	.tertiary(100, 'Holy ornament kit');

class TheatreOfBloodClass {
	nonUniqueLoot(member: ParsedMember, isHardMode: boolean, deaths: number[]) {
		if (deaths.length === TOBRooms.length) {
			return new Bank().add('Cabbage');
		}

		const loot = new Bank();
		for (let i = 0; i < 3; i++) {
			loot.add(NonUniqueTable.roll());
		}

		let clueRate = 3 / 25;
		if (isHardMode) {
			// Add 15% extra regular loot for hard mode:
			for (const [item] of loot.items()) {
				loot.set(item.id, Math.ceil(loot.amount(item.id) * 1.15));
			}
			// Add HM Tertiary drops: dust / kits
			loot.add(HardModeExtraTable.roll());

			clueRate = 3.5 / 25;
		}

		if (Math.random() < clueRate) {
			loot.add('Clue scroll (elite)');
		}

		let petChance = isHardMode ? 500 : 650;
		if (member.numDeaths > 0) {
			petChance *= member.numDeaths;
		}
		if (roll(petChance)) {
			loot.add("Lil' zik");
		}

		return loot;
	}

	public uniqueDecide(team: ParsedMember[]) {
		const table = new SimpleTable<ParsedMember>();
		for (const member of team) {
			table.add(member, member.points);
		}

		return table.roll();
	}

	public complete(_options: TheatreOfBloodOptions) {
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

		const percentBaseChanceOfUnique = (options.hardMode ? 13 : 11) * (teamPoints / maxPointsTeamCanGet);

		const purpleReceived = percentChance(percentBaseChanceOfUnique);
		const purpleRecipient = purpleReceived ? this.uniqueDecide(parsedTeam) : null;

		const lootResult: LootBank = {};

		for (const member of parsedTeam) {
			if (member === purpleRecipient) {
				lootResult[member.id] = new Bank().add(
					options.hardMode ? HardModeUniqueTable.roll() : UniqueTable.roll()
				);
			} else {
				lootResult[member.id] = this.nonUniqueLoot(member, options.hardMode, member.deaths);
			}
		}

		return {
			loot: lootResult,
			percentChanceOfUnique: percentBaseChanceOfUnique,
			totalDeaths,
			teamPoints
		};
	}
}

export const TheatreOfBlood = new TheatreOfBloodClass();
