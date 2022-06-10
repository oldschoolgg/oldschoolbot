import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Runes: DisassemblySourceGroup = {
	name: 'Runes',
	items: [
		{ item: i('Air rune'), lvl: 1 },
		{ item: i('Fire rune'), lvl: 1 },
		{ item: i('Body rune'), lvl: 1 },
		{ item: i('Earth rune'), lvl: 1 },
		{ item: i('Mind rune'), lvl: 1 },
		{ item: i('Water rune'), lvl: 1 },
		{ item: i('Mist rune'), lvl: 6 },
		{ item: i('Dust rune'), lvl: 10 },
		{ item: i('Mud rune'), lvl: 12 },
		{ item: i('Smoke rune'), lvl: 15 },
		{ item: i('Steam rune'), lvl: 19 },
		{ item: i('Lava rune'), lvl: 23 },
		{ item: i('Cosmic rune'), lvl: 27 },
		{ item: i('Chaos rune'), lvl: 35 },
		{ item: i('Astral rune'), lvl: 40 },
		{ item: i('Nature rune'), lvl: 44 },
		{ item: i('Law rune'), lvl: 54 },
		{ item: i('Death rune'), lvl: 65 },
		{ item: i('Blood rune'), lvl: 77 },
		{ item: i('Soul rune'), lvl: 90 },
		{ item: i('Wrath rune'), lvl: 95 },
		{ item: i('Elder rune'), lvl: 99 }
	],
	parts: { powerful: 5, magic: 85, base: 10 }
};
