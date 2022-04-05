import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Runes: DisassemblySourceGroup = {
	name: 'Runes',
	items: [
		{ item: i('Mind rune'), lvl: 1, partQuantity: 8 },
		{ item: i('Water rune'), lvl: 5, partQuantity: 8 },
		{ item: i('Mist rune'), lvl: 6, partQuantity: 8 },
		{ item: i('Earth rune'), lvl: 9, partQuantity: 8 },
		{ item: i('Dust rune'), lvl: 10, partQuantity: 8 },
		{ item: i('Mud rune'), lvl: 12, partQuantity: 8 },
		{ item: i('Fire rune'), lvl: 14, partQuantity: 8 },
		{ item: i('Smoke rune'), lvl: 15, partQuantity: 8 },
		{ item: i('Steam rune'), lvl: 19, partQuantity: 8 },
		{ item: i('Body rune'), lvl: 20, partQuantity: 8 },
		{ item: i('Lava rune'), lvl: 23, partQuantity: 8 },
		{ item: i('Cosmic rune'), lvl: 27, partQuantity: 8 },
		{ item: i('Chaos rune'), lvl: 35, partQuantity: 8 },
		{ item: i('Astral rune'), lvl: 40, partQuantity: 8 },
		{ item: i('Nature rune'), lvl: 44, partQuantity: 8 },
		{ item: i('Law rune'), lvl: 54, partQuantity: 8 },
		{ item: i('Death rune'), lvl: 65, partQuantity: 8 },
		{ item: i('Blood rune'), lvl: 77, partQuantity: 8 },
		{ item: i('Soul rune'), lvl: 90, partQuantity: 8 }
	],
	parts: { powerful: 2, crafted: 13, magic: 85 }
};

export default Runes;
