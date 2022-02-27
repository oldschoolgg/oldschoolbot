import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Crossbows2h: DisassemblySourceGroup = {
	name: 'Crossbows2h',
	items: [{ item: i("Orange salamander"), lvl: 50 },{ item: i("Fixed device"), lvl: 60 },{ item: i("Red salamander"), lvl: 60 },{ item: i("Black salamander"), lvl: 70 },{ item: i("Karil's crossbow"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 12 }, ] } },],
	parts: {stunning: 3, dextrous: 2, connector: 35, tensile: 30, crafted: 30},
  partQuantity: 12
};

export default Crossbows2h;
