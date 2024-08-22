import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const TreasureTrails: DisassemblySourceGroup = {
	name: 'Treasure Trails',
	items: [
		{ item: i('Clue scroll (beginner)'), lvl: 10 },
		{ item: i('Reward casket (beginner)'), lvl: 15, outputMultiplier: 4 },

		{ item: i('Clue scroll (easy)'), lvl: 30 },
		{ item: i('Reward casket (easy)'), lvl: 35, outputMultiplier: 4 },

		{ item: i('Clue scroll (medium)'), lvl: 50 },
		{ item: i('Reward casket (medium)'), lvl: 55, outputMultiplier: 4 },

		{ item: i('Clue scroll (hard)'), lvl: 80 },
		{ item: i('Reward casket (hard)'), lvl: 85, outputMultiplier: 4 },

		{ item: i('Clue scroll (elite)'), lvl: 90 },
		{ item: i('Reward casket (elite)'), lvl: 95, outputMultiplier: 4 },

		{ item: i('Clue scroll (master)'), lvl: 99 },
		{ item: i('Reward casket (master)'), lvl: 99, outputMultiplier: 4 },

		{ item: i('Clue scroll (grandmaster)'), lvl: 99 },
		{ item: i('Reward casket (grandmaster)'), lvl: 99, outputMultiplier: 4 },

		{ item: i('Clue scroll (elder)'), lvl: 99 },
		{ item: i('Reward casket (elder)'), lvl: 99, outputMultiplier: 4 }
	],
	parts: { treasured: 100 }
};
