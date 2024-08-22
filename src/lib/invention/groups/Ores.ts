import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Ores: DisassemblySourceGroup = {
	name: 'Ores',
	items: [
		{ item: i('Copper ore'), lvl: 1 },
		{ item: i('Tin ore'), lvl: 1 },
		{ item: i('Iron ore'), lvl: 15 },
		{ item: i('Silver ore'), lvl: 20 },
		{ item: i('Coal'), lvl: 30 },
		{ item: i('Gold ore'), lvl: 40 },
		{ item: i('Mithril ore'), lvl: 60 },
		{ item: i('Adamantite ore'), lvl: 80 },
		{ item: i('Runite ore'), lvl: 95 }
	],
	parts: { rocky: 70, heavy: 20, metallic: 10 }
};
