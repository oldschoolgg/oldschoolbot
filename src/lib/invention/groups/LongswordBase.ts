import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const LongswordBase: DisassemblySourceGroup = {
	name: 'LongswordBase',
	items: [{ item: i("Bronze longsword"), lvl: 1 },{ item: i("Iron longsword"), lvl: 10 },{ item: i("Steel longsword"), lvl: 20 },{ item: i("Mithril longsword"), lvl: 30 },{ item: i("Rune longsword"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default LongswordBase;
