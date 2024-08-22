import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const BoltTips: DisassemblySourceGroup = {
	name: 'Bolt Tips',
	items: [
		{ item: i('Opal bolt tips'), lvl: 11 },
		{ item: i('Jade bolt tips'), lvl: 26 },
		{ item: i('Topaz bolt tips'), lvl: 48 },
		{ item: i('Sapphire bolt tips'), lvl: 56 },
		{ item: i('Emerald bolt tips'), lvl: 58 },
		{ item: i('Ruby bolt tips'), lvl: 63 },
		{ item: i('Diamond bolt tips'), lvl: 65 },
		{ item: i('Dragonstone bolt tips'), lvl: 71 },
		{ item: i('Onyx bolt tips'), lvl: 73 },
		{ item: i('Amethyst bolt tips'), lvl: 83 }
	],
	parts: { base: 10, sharp: 40, precious: 10 }
};
