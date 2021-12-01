import { sumArr } from 'e';
import { LootTable } from 'oldschooljs';
import { LootBank } from 'oldschooljs/dist/meta/types';

import { ItemBank } from '../types';
import { assert, convertLootBanksToItemBanks, JSONClone } from '../util';

export interface TeamMember {
	id: string;
	/**
	 * The rooms they died in.
	 */
	deaths: number[];
}

const Rooms = [
	{
		name: 'Maiden'
	},
	{
		name: 'Bloat'
	},
	{
		name: 'Nylocas'
	},
	{
		name: 'Soteseteg'
	},
	{
		name: 'Xarps'
	},
	{
		name: 'Vitir Verizk'
	}
];

export interface TheatreOfBloodOptions {
	/**
	 * Whether or not this raid is in Challenge Mode or not.
	 */
	hardMode?: boolean;
	/**
	 * The members of the raid team, 1-5 people.
	 */
	team: TeamMember[];
}

const UniqueTable = new LootTable()
	.add('Scythe of vitur')
	.add('Ghrazi rapier', 2)
	.add('Sanguinesti staff', 2)
	.add('Justiciar faceguard', 2)
	.add('Justiciar chestguard', 2)
	.add('Justiciar legguards', 2)
	.add('Avernic defender hilt', 8);

export class TheatreOfBloodClass {
	public complete(_options: TheatreOfBloodOptions): {
		[key: string]: ItemBank;
	} {
		const options = JSONClone(_options);
		assert(options.team.length >= 1 || options.team.length <= 5, 'TOB team must have 1-5 members');

		const maxPointsPerPerson = 22;
		const maxPointsTeamCanGet = options.team.length * maxPointsPerPerson;
		const teamPoints = sumArr(options.team.map(val => val.points));
		assert(teamPoints <= maxPointsTeamCanGet, 'Cannot exceed max points');

		const percentBaseChanceOfUnique = 11;

		const lootResult: LootBank = {};

		return convertLootBanksToItemBanks(lootResult);
	}
}

export const TheatreOfBlood = new TheatreOfBloodClass();
