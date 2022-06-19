import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bones: DisassemblySourceGroup = {
	name: 'Bones',
	items: [
		{ item: i('Bones'), lvl: 1 },
		{ item: i('Wolf bones'), lvl: 1 },
		{ item: i('Monkey bones'), lvl: 1 },
		{ item: i('Bat bones'), lvl: 2 },
		{ item: i('Big bones'), lvl: 6 },
		{ item: i('Curved bone'), lvl: 6 },
		{ item: i('Jogre bones'), lvl: 6 },
		{ item: i('Long bone'), lvl: 6 },
		{ item: i('Zogre bones'), lvl: 9 },
		{ item: i('Shaikahan bones'), lvl: 10 },
		{ item: i('Babydragon bones'), lvl: 12 },
		{ item: i('Wyrm bones'), lvl: 12 },
		{ item: i('Hydra bones'), lvl: 18 },
		{ item: i('Wyvern bones'), lvl: 20 },
		{ item: i('Dragon bones'), lvl: 28 },
		{ item: i('Fayrg bones'), lvl: 33 },
		{ item: i('Raurg bones'), lvl: 38 },
		{ item: i('Dagannoth bones'), lvl: 50 },
		{ item: i('Ourg bones'), lvl: 56 },
		{ item: i('Drake bones'), lvl: 56 },
		{ item: i('Lava dragon bones'), lvl: 62 },
		{ item: i('Superior dragon bones'), lvl: 70 },
		{ item: i('Frost dragon bones'), lvl: 80 },
		{ item: i('Royal dragon bones'), lvl: 99 },
		{ item: i('Abyssal dragon bones'), lvl: 99 }
	],
	parts: { pious: 80, organic: 20 }
};
