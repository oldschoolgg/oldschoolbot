import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MagicShield: DisassemblySourceGroup = {
	name: 'MagicShield',
	items: [{ item: i("Elemental shield"), lvl: 1, special: { always: true, parts: [{ type: "harnessed", chance: 100, amount: 8 }, ] } },{ item: i("Mind shield"), lvl: 1, special: { always: true, parts: [{ type: "harnessed", chance: 100, amount: 8 }, ] } },{ item: i("Dragonfire ward"), lvl: 70, special: { always: true, parts: [{ type: "dragonfire", chance: 100, amount: 3 }, ] } },{ item: i("Arcane spirit shield"), lvl: 75, special: { always: true, parts: [{ type: "corporeal", chance: 100, amount: 4 }, ] } },{ item: i("Spectral spirit shield"), lvl: 75, special: { always: true, parts: [{ type: "corporeal", chance: 100, amount: 4 }, ] } },],
	parts: {},
  partQuantity: 8
};

export default MagicShield;
