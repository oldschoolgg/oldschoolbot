import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const PickaxeBase: DisassemblySourceGroup = {
	name: 'PickaxeBase',
	items: [{ item: i("Bronze pickaxe"), lvl: 1 },{ item: i("Iron pickaxe"), lvl: 10 },{ item: i("Steel pickaxe"), lvl: 20 },{ item: i("Mithril pickaxe"), lvl: 30 },{ item: i("Rune pickaxe"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default PickaxeBase;
