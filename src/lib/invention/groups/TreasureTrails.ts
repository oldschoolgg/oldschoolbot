import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const TreasureTrails: DisassemblySourceGroup = {
	name: 'Treasure Trails',
	items: [
		{ item: i('Clue scroll (beginner)'), lvl: 1, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (beginner)'), lvl: 1, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (easy)'), lvl: 10, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (easy)'), lvl: 10, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (medium)'), lvl: 30, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (medium)'), lvl: 30, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (hard)'), lvl: 45, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (hard)'), lvl: 45, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (elite)'), lvl: 60, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (elite)'), lvl: 60, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (master)'), lvl: 80, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (master)'), lvl: 80, flags: new Set(['treasure_trails']) },

		{ item: i('Clue scroll (grandmaster)'), lvl: 120, flags: new Set(['treasure_trails']) },
		{ item: i('Reward casket (grandmaster)'), lvl: 120, flags: new Set(['treasure_trails']) }
	],
	parts: { treasured: 100 }
};
