import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [
		{ item: i('Fremennik shield'), lvl: 1, partQuantity: 8 },
		{ item: i('Training shield'), lvl: 1, partQuantity: 8 },
		{ item: i('Wooden shield'), lvl: 1, partQuantity: 8 },
		{
			item: i('Black kiteshield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Black kiteshield (g)'), lvl: 25, partQuantity: 8 },
		{ item: i('Black kiteshield (t)'), lvl: 25, partQuantity: 8 },
		{
			item: i('Black shield (h1)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h2)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h3)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h4)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h5)'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black sq shield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White kiteshield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White sq shield'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Rune kiteshield (g)'), lvl: 50, partQuantity: 8 },
		{ item: i('Rune kiteshield (t)'), lvl: 50, partQuantity: 8 },
		{
			item: i('Rune shield (h1)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h2)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h3)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h4)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h5)'),
			lvl: 50,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Spirit shield'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon sq shield'), lvl: 60, partQuantity: 8 },
		{ item: i('Toktz-ket-xil'), lvl: 60, partQuantity: 8 },
		{
			item: i('Blessed spirit shield'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 8 }] }
		},
		{
			item: i('Crystal shield'),
			lvl: 70,
			partQuantity: 8,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 8 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{
			item: i('Dragonfire shield'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'dragonfire', chance: 100, amount: 3 }] }
		},
		{ item: i('Bronze kiteshield'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron kiteshield'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel kiteshield'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril kiteshield'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune kiteshield'), lvl: 50, partQuantity: 8 },
		{ item: i('Granite shield'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon kiteshield'), lvl: 60, partQuantity: 8 }
	],
	parts: { cover: 35, base: 30, deflecting: 30, strong: 3, protective: 2 }
};

export default Shield;
