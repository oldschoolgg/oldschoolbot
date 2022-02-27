import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Knives: DisassemblySourceGroup = {
	name: 'Knives',
	items: [{ item: i("Bronze knife"), lvl: 1 },{ item: i("Holy water"), lvl: 1 },{ item: i("Iron knife"), lvl: 10 },{ item: i("Steel knife"), lvl: 20 },{ item: i("Black knife"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Mithril knife"), lvl: 30 },{ item: i("Rune knife"), lvl: 50 },{ item: i("Dragon knife"), lvl: 60 },],
	parts: {simple: 35, metallic: 30, sharp: 3, swift: 2, blade: 30},
  partQuantity: 8
};

export default Knives;
