import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Sword: DisassemblySourceGroup = {
	name: 'Sword',
	items: [{ item: i("Barb-tail harpoon"), lvl: 1 },{ item: i("Egg whisk"), lvl: 1, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Magic butterfly net"), lvl: 1 },{ item: i("Magic secateurs"), lvl: 1 },{ item: i("Training sword"), lvl: 1 },{ item: i("Spork"), lvl: 10, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Black sword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("White sword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Kitchen knife"), lvl: 40, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 8 }, ] } },{ item: i("Rapier"), lvl: 40 },{ item: i("Leaf-bladed sword"), lvl: 55 },{ item: i("Toktz-xil-ak"), lvl: 60 },],
	parts: {blade: 30, metallic: 30, precise: 3, base: 35, dextrous: 2},
  partQuantity: 8
};

export default Sword;
