import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Runes: DisassemblySourceGroup = {
	name: 'Runes',
	items: [{ item: i("Mind rune"), lvl: 1 },{ item: i("Water rune"), lvl: 5 },{ item: i("Mist rune"), lvl: 6 },{ item: i("Earth rune"), lvl: 9 },{ item: i("Dust rune"), lvl: 10 },{ item: i("Mud rune"), lvl: 12 },{ item: i("Fire rune"), lvl: 14 },{ item: i("Smoke rune"), lvl: 15 },{ item: i("Steam rune"), lvl: 19 },{ item: i("Body rune"), lvl: 20 },{ item: i("Lava rune"), lvl: 23 },{ item: i("Cosmic rune"), lvl: 27 },{ item: i("Chaos rune"), lvl: 35 },{ item: i("Astral rune"), lvl: 40 },{ item: i("Nature rune"), lvl: 44 },{ item: i("Law rune"), lvl: 54 },{ item: i("Death rune"), lvl: 65 },{ item: i("Blood rune"), lvl: 77 },{ item: i("Soul rune"), lvl: 90 },],
	parts: {powerful: 2, crafted: 13, magic: 85},
  partQuantity: 8
};

export default Runes;
