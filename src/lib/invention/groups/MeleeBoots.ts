import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MeleeBoots: DisassemblySourceGroup = {
	name: 'MeleeBoots',
	items: [{ item: i("Fancy boots"), lvl: 1 },{ item: i("Fighting boots"), lvl: 1 },{ item: i("Rock-climbing boots"), lvl: 1 },{ item: i("Black boots"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 4 }, ] } },{ item: i("White boots"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 4 }, ] } },{ item: i("Rock-shell boots"), lvl: 50 },{ item: i("Dragon boots"), lvl: 60 },{ item: i("Bandos boots"), lvl: 70, special: { always: true, parts: [{ type: "bandos", chance: 100, amount: 4 }, ] } },],
	parts: {},
  partQuantity: 4
};

export default MeleeBoots;
