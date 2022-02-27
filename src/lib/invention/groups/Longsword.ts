import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Longsword: DisassemblySourceGroup = {
	name: 'Longsword',
	items: [{ item: i("Blurite sword"), lvl: 1 },{ item: i("Fremennik blade"), lvl: 1 },{ item: i("Jade machete"), lvl: 1 },{ item: i("Machete"), lvl: 1 },{ item: i("Opal machete"), lvl: 1 },{ item: i("Red topaz machete"), lvl: 1 },{ item: i("Teasing stick"), lvl: 1 },{ item: i("Wooden spoon"), lvl: 1, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Harry's cutlass"), lvl: 20 },{ item: i("Black longsword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("White longsword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Excalibur"), lvl: 30 },{ item: i("Lucky cutlass"), lvl: 30 },{ item: i("Skewer"), lvl: 30, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Cleaver"), lvl: 40, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Dragon longsword"), lvl: 60 },{ item: i("Vesta's longsword"), lvl: 78 },],
	parts: {blade: 30, metallic: 30, sharp: 3, base: 35, dextrous: 2},
  partQuantity: 8
};

export default Longsword;
