import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bones: DisassemblySourceGroup = {
	name: 'Bones',
	items: [
		{ item: i('Bones'), lvl: 1, partQuantity: 2 },
		{ item: i('Wolf bones'), lvl: 1, partQuantity: 2 },
		{ item: i('Bat bones'), lvl: 2, partQuantity: 2 },
		{ item: i('Big bones'), lvl: 6, partQuantity: 2 },
		{ item: i('Burnt jogre bones'), lvl: 6, partQuantity: 2 },
		{ item: i('Curved bone'), lvl: 6, partQuantity: 2 },
		{ item: i('Jogre bones'), lvl: 6, partQuantity: 2 },
		{ item: i('Long bone'), lvl: 6, partQuantity: 2 },
		{ item: i('Zogre bones'), lvl: 9, partQuantity: 2 },
		{ item: i('Shaikahan bones'), lvl: 10, partQuantity: 2 },
		{ item: i('Babydragon bones'), lvl: 12, partQuantity: 2 },
		{ item: i('Wyvern bones'), lvl: 20, partQuantity: 2 },
		{ item: i('Dragon bones'), lvl: 28, partQuantity: 2 },
		{ item: i('Fayrg bones'), lvl: 33, partQuantity: 2 },
		{ item: i('Raurg bones'), lvl: 38, partQuantity: 2 },
		{ item: i('Dagannoth bones'), lvl: 50, partQuantity: 2 },
		{ item: i('Ourg bones'), lvl: 56, partQuantity: 2 }
	],
	parts: { pious: 2, organic: 98 }
};

export default Bones;
