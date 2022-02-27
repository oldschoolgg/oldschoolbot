import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Sword2h: DisassemblySourceGroup = {
	name: 'Sword2h',
	items: [{ item: i("Slender blade"), lvl: 1 },{ item: i("Spatula"), lvl: 10, special: { always: false, parts: [{ type: "culinary", chance: 100, amount: 12 }, ] } },{ item: i("Black 2h sword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 12 }, ] } },{ item: i("White 2h sword"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 12 }, ] } },{ item: i("Dragon 2h sword"), lvl: 60 },{ item: i("Armadyl godsword"), lvl: 75, special: { always: true, parts: [{ type: "armadyl", chance: 100, amount: 12 }, ] } },{ item: i("Bandos godsword"), lvl: 75, special: { always: true, parts: [{ type: "bandos", chance: 100, amount: 12 }, ] } },{ item: i("Saradomin godsword"), lvl: 75, special: { always: true, parts: [{ type: "saradomin", chance: 100, amount: 12 }, ] } },{ item: i("Saradomin sword"), lvl: 75, special: { always: true, parts: [{ type: "saradomin", chance: 100, amount: 12 }, ] } },{ item: i("Zamorak godsword"), lvl: 75, special: { always: true, parts: [{ type: "zamorak", chance: 100, amount: 12 }, ] } },],
	parts: {blade: 30, metallic: 30, strong: 2, sharp: 3, base: 35},
  partQuantity: 12
};

export default Sword2h;
