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
		{ item: i('Mist rune'), lvl: 3 },
		{ item: i('Dust rune'), lvl: 3 },
		{ item: i('Mud rune'), lvl: 3 },
		{ item: i('Smoke rune'), lvl: 3 },
		{ item: i('Steam rune'), lvl: 3 },
		{ item: i('Lava rune'), lvl: 3 },
		{ item: i('Cosmic rune'), lvl: 12 },
		{ item: i('Chaos rune'), lvl: 20 },
		{ item: i('Astral rune'), lvl: 25 },
		{ item: i('Nature rune'), lvl: 29 },
		{ item: i('Law rune'), lvl: 39 },
		{ item: i('Death rune'), lvl: 45 },
		{ item: i('Blood rune'), lvl: 55 },
		{ item: i('Soul rune'), lvl: 65 },
		{ item: i('Wrath rune'), lvl: 75 },
		{ item: i('Elder rune'), lvl: 99 }
	],
	parts: { powerful: 5, magic: 60, base: 5, junk: 30 },
	xpReductionDivisor: 1.5
};
