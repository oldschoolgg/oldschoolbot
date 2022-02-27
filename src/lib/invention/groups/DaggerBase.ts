import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const DaggerBase: DisassemblySourceGroup = {
	name: 'DaggerBase',
	items: [{ item: i("Bronze dagger"), lvl: 1 },{ item: i("Iron dagger"), lvl: 10 },{ item: i("Steel dagger"), lvl: 20 },{ item: i("Mithril dagger"), lvl: 30 },{ item: i("Rune dagger"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default DaggerBase;
