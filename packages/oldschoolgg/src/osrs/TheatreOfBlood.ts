import { percentChance, roll } from 'node-rng';

import { Bank, LootTable } from '@/osrs/index.js';
import { SimpleTable } from '@/osrs/SimpleTable.js';

interface TeamMember {
	id: string;
	deaths: number[];
}

interface TheatreOfBloodOptions {
	hardMode: boolean;
	team: TeamMember[];
}

interface ParsedMember extends TeamMember {
	numDeaths: number;
	points: number;
}
interface TOBRoom {
	name: string;
	difficultyRating: number;
	timeWeighting: number;
}

const TOBRooms: TOBRoom[] = [
	{
		name: 'Maiden',
		difficultyRating: 1,
		timeWeighting: 11
	},
	{
		name: 'Bloat',
		difficultyRating: 4,
		timeWeighting: 11
	},
	{
		name: 'Nylocas',
		difficultyRating: 3,
		timeWeighting: 22
	},
	{
		name: 'Sotetseg',
		difficultyRating: 2,
		timeWeighting: 11
	},
	{
		name: 'Xarpus',
		difficultyRating: 2,
		timeWeighting: 17
	},
	{
		name: 'Verzik',
		difficultyRating: 6,
		timeWeighting: 28
	}
];

const ToBUniqueTable: LootTable = new LootTable()
	.add('Scythe of vitur (uncharged)')
	.add('Ghrazi rapier', 1, 2)
	.add('Sanguinesti staff (uncharged)', 1, 2)
	.add('Justiciar faceguard', 1, 2)
	.add('Justiciar chestguard', 1, 2)
	.add('Justiciar legguards', 1, 2)
	.add('Avernic defender hilt', 1, 8);

const HardModeUniqueTable: LootTable = new LootTable()
	.add('Scythe of vitur (uncharged)')
	.add('Ghrazi rapier', 1, 2)
	.add('Sanguinesti staff (uncharged)', 1, 2)
	.add('Justiciar faceguard', 1, 2)
	.add('Justiciar chestguard', 1, 2)
	.add('Justiciar legguards', 1, 2)
	.add('Avernic defender hilt', 1, 7);

const NonUniqueTable: LootTable = new LootTable()
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

const HardModeExtraTable: LootTable = new LootTable()
	.tertiary(275, 'Sanguine dust')
	.tertiary(150, 'Sanguine ornament kit')
	.tertiary(100, 'Holy ornament kit');

export class TheatreOfBloodClass {
	nonUniqueLoot(member: ParsedMember, isHardMode: boolean, deaths: number[]): Bank {
		if (deaths.length === TOBRooms.length) {
			return new Bank().add('Cabbage');
		}
		const loot = new Bank();
		for (let i = 0; i < 3; i++) {
			loot.add(NonUniqueTable.roll());
		}

		if (isHardMode) {
			// Add 15% extra regular loot for hard mode:
			for (const [item] of loot.items()) {
				loot.set(item.id, Math.ceil(loot.amount(item.id) * 1.15));
			}
			// Add HM Tertiary drops: dust / kits
			loot.add(HardModeExtraTable.roll());
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

	public uniqueDecide(team: ParsedMember[]): ParsedMember | null {
		const table = new SimpleTable<ParsedMember>();
		for (const member of team) {
			table.add(member, member.points);
		}

		return table.roll();
	}

	public complete(options: TheatreOfBloodOptions) {
		const maxPointsPerPerson = 22;
		const penaltyForDeath = 4;
		const maxPointsTeamCanGet = options.team.length * maxPointsPerPerson;

		const parsedTeam: ParsedMember[] = options.team.map(t => ({
			id: t.id,
			deaths: t.deaths,
			numDeaths: t.deaths.length,
			points: maxPointsPerPerson - t.deaths.length * penaltyForDeath
		}));

		const teamPoints = parsedTeam.map(val => val.points).reduce((a, b) => a + b, 0);

		const percentBaseChanceOfUnique = (options.hardMode ? 13 : 11) * (teamPoints / maxPointsTeamCanGet);

		const purpleReceived = percentChance(percentBaseChanceOfUnique);
		const purpleRecipient = purpleReceived ? this.uniqueDecide(parsedTeam) : null;

		for (const member of parsedTeam) {
			if (member === purpleRecipient) {
				return new Bank().add(options.hardMode ? HardModeUniqueTable.roll() : ToBUniqueTable.roll());
			} else {
				return this.nonUniqueLoot(member, options.hardMode, member.deaths);
			}
		}
		return new Bank();
	}
}

export const TheatreOfBlood: TheatreOfBloodClass = new TheatreOfBloodClass();
