import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Crossbows: DisassemblySourceGroup = {
	name: 'Crossbows',
	items: [{ item: i("Dorgeshuun crossbow"), lvl: 28 },{ item: i("Rune crossbow"), lvl: 50 },{ item: i("Armadyl crossbow"), lvl: 75, special: { always: true, parts: [{ type: "armadyl", chance: 100, amount: 8 }, ] } },],
	parts: {stunning: 3, dextrous: 2, connector: 35, tensile: 30, spiked: 30},
  partQuantity: 8
};

export default Crossbows;
