import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const SwordBase2h: DisassemblySourceGroup = {
	name: 'SwordBase2h',
	items: [{ item: i("Bronze 2h sword"), lvl: 1 },{ item: i("Iron 2h sword"), lvl: 10 },{ item: i("Steel 2h sword"), lvl: 20 },{ item: i("Mithril 2h sword"), lvl: 30 },{ item: i("Rune 2h sword"), lvl: 50 },],
	parts: {},
  partQuantity: 16
};

export default SwordBase2h;
