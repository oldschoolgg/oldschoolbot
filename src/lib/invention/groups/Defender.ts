import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Defender: DisassemblySourceGroup = {
	name: 'Defender',
	items: [
		{ item: i('Bronze defender'), lvl: 1 },
		{ item: i('Iron defender'), lvl: 10 },
		{ item: i('Steel defender'), lvl: 20 },
		{ item: i('Black defender'), lvl: 25 },
		{ item: i('Mithril defender'), lvl: 30 },
		{ item: i('Adamant defender'), lvl: 40 },
		{ item: i('Rune defender'), lvl: 50 },
		{ item: i('Dragon defender'), lvl: 60, flags: new Set(['orikalkum']) }
	],
	parts: { base: 10, protective: 40, sharp: 10 }
};
