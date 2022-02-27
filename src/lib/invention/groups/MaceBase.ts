import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MaceBase: DisassemblySourceGroup = {
	name: 'MaceBase',
	items: [{ item: i("Bronze mace"), lvl: 1 },{ item: i("Iron mace"), lvl: 10 },{ item: i("Steel mace"), lvl: 20 },{ item: i("Mithril mace"), lvl: 30 },{ item: i("Rune mace"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default MaceBase;
