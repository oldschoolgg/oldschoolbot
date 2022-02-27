import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Ranged6: DisassemblySourceGroup = {
	name: 'Ranged6',
	items: [{ item: i("Ava's attractor"), lvl: 1 },{ item: i("Greater demon mask"), lvl: 29, special: { always: true, parts: [{ type: "historic", chance: 100, amount: 6 }, { type: "classic", chance: 100, amount: 5 }, { type: "timeworn", chance: 100, amount: 6 }, { type: "vintage", chance: 100, amount: 1 }, ] } },{ item: i("Imp mask"), lvl: 29, special: { always: true, parts: [{ type: "historic", chance: 100, amount: 6 }, { type: "classic", chance: 100, amount: 5 }, { type: "timeworn", chance: 100, amount: 6 }, { type: "vintage", chance: 100, amount: 1 }, ] } },{ item: i("Lesser demon mask"), lvl: 29, special: { always: true, parts: [{ type: "historic", chance: 100, amount: 6 }, { type: "classic", chance: 100, amount: 5 }, { type: "timeworn", chance: 100, amount: 6 }, { type: "vintage", chance: 100, amount: 1 }, ] } },],
	parts: {},
  partQuantity: 6
};

export default Ranged6;
