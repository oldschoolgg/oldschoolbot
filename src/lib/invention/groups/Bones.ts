import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Bones: DisassemblySourceGroup = {
	name: 'Bones',
	items: [{ item: i("Bones"), lvl: 1 },{ item: i("Burnt bones"), lvl: 1 },{ item: i("Small ninja monkey bones"), lvl: 1 },{ item: i("Wolf bones"), lvl: 1 },{ item: i("Bat bones"), lvl: 2 },{ item: i("Big bones"), lvl: 6 },{ item: i("Burnt jogre bones"), lvl: 6 },{ item: i("Curved bone"), lvl: 6 },{ item: i("Jogre bones"), lvl: 6 },{ item: i("Long bone"), lvl: 6 },{ item: i("Zogre bones"), lvl: 9 },{ item: i("Shaikahan bones"), lvl: 10 },{ item: i("Babydragon bones"), lvl: 12 },{ item: i("Wyvern bones"), lvl: 20 },{ item: i("Dragon bones"), lvl: 28 },{ item: i("Fayrg bones"), lvl: 33 },{ item: i("Raurg bones"), lvl: 38 },{ item: i("Dagannoth bones"), lvl: 50 },{ item: i("Ourg bones"), lvl: 56 },],
	parts: {pious: 2, organic: 98},
  partQuantity: 2
};

export default Bones;
