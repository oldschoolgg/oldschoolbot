import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const RangedBody: DisassemblySourceGroup = {
	name: 'RangedBody',
	items: [{ item: i("Leather body"), lvl: 1 },{ item: i("Leather chaps"), lvl: 1 },{ item: i("Hardleather body"), lvl: 10 },{ item: i("Studded body"), lvl: 20 },{ item: i("Studded body (g)"), lvl: 20, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Studded body (t)"), lvl: 20, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Studded chaps"), lvl: 20 },{ item: i("Frog-leather body"), lvl: 25 },{ item: i("Frog-leather chaps"), lvl: 25 },{ item: i("Snakeskin body"), lvl: 30 },{ item: i("Snakeskin chaps"), lvl: 30 },{ item: i("Armadyl robe top"), lvl: 40, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Spined body"), lvl: 50 },{ item: i("Armadyl chestplate"), lvl: 70, special: { always: true, parts: [{ type: "armadyl", chance: 100, amount: 8 }, ] } },{ item: i("Morrigan's leather body"), lvl: 78 },],
	parts: {},
  partQuantity: 8
};

export default RangedBody;
