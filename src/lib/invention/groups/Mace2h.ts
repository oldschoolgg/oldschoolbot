import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Mace2h: DisassemblySourceGroup = {
	name: 'Mace2h',
	items: [{ item: i("Verac's flail"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 12 }, ] } },],
	parts: {},
  partQuantity: 12
};

export default Mace2h;
