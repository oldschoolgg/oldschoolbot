import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MeleeShieldBase: DisassemblySourceGroup = {
	name: 'MeleeShieldBase',
	items: [{ item: i("Bronze kiteshield"), lvl: 1 },{ item: i("Iron kiteshield"), lvl: 10 },{ item: i("Steel kiteshield"), lvl: 20 },{ item: i("Mithril kiteshield"), lvl: 30 },{ item: i("Rune kiteshield"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default MeleeShieldBase;
