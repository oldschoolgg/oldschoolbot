import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeShield: DisassemblySourceGroup = {
	name: 'MeleeShield',
	items: [
		{ item: i('Fremennik shield'), lvl: 1 },
		{ item: i('Training shield'), lvl: 1 },
		{ item: i('Wooden shield'), lvl: 1 },
		{
			item: i('Black kiteshield'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Black kiteshield (g)'), lvl: 25 },
		{ item: i('Black kiteshield (t)'), lvl: 25 },
		{
			item: i('Black shield (h1)'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h2)'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h3)'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h4)'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black shield (h5)'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black sq shield'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White kiteshield'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White sq shield'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Rune kiteshield (g)'), lvl: 50 },
		{ item: i('Rune kiteshield (t)'), lvl: 50 },
		{
			item: i('Rune shield (h1)'),
			lvl: 50,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h2)'),
			lvl: 50,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h3)'),
			lvl: 50,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h4)'),
			lvl: 50,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune shield (h5)'),
			lvl: 50,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Spirit shield'), lvl: 55 },
		{ item: i('Dragon sq shield'), lvl: 60 },
		{ item: i('Toktz-ket-xil'), lvl: 60 },
		{
			item: i('Blessed spirit shield'),
			lvl: 70,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 8 }] }
		},
		{
			item: i('Crystal shield'),
			lvl: 70,
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
			special: { always: true, parts: [{ type: 'dragonfire', chance: 100, amount: 3 }] }
		}
	],
	parts: {},
	partQuantity: 8
};

export default MeleeShield;
