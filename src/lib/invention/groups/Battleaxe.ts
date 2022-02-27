import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Battleaxe: DisassemblySourceGroup = {
	name: 'Battleaxe',
	items: [{ item: i("Black battleaxe"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("White battleaxe"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Dragon battleaxe"), lvl: 60 },],
	parts: {blade: 30, head: 35, direct: 2, sharp: 3, smooth: 30},
  partQuantity: 8
};

export default Battleaxe;
