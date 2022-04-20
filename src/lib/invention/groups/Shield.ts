import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [
		{ item: i('Fremennik shield'), lvl: 1 },
		{
			item: i('Black kiteshield'),
			lvl: 25
		},
		{ item: i('Black kiteshield (g)'), lvl: 25 },
		{ item: i('Black kiteshield (t)'), lvl: 25 },
		{
			item: i('Black shield (h1)'),
			lvl: 25
		},
		{
			item: i('Black shield (h2)'),
			lvl: 25
		},
		{
			item: i('Black shield (h3)'),
			lvl: 25
		},
		{
			item: i('Black shield (h4)'),
			lvl: 25
		},
		{
			item: i('Black shield (h5)'),
			lvl: 25
		},
		{
			item: i('Black sq shield'),
			lvl: 25
		},
		{
			item: i('White kiteshield'),
			lvl: 25
		},
		{
			item: i('White sq shield'),
			lvl: 25
		},
		{ item: i('Rune kiteshield (g)'), lvl: 50 },
		{ item: i('Rune kiteshield (t)'), lvl: 50 },
		{
			item: i('Rune shield (h1)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h2)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h3)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h4)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h5)'),
			lvl: 50
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
				parts: [{ type: 'crystal', chance: 74, amount: 8 }]
			}
		},
		{
			item: i('Dragonfire shield'),
			lvl: 70
		},
		{ item: i('Bronze kiteshield'), lvl: 1 },
		{ item: i('Iron kiteshield'), lvl: 10 },
		{ item: i('Steel kiteshield'), lvl: 20 },
		{ item: i('Mithril kiteshield'), lvl: 30 },
		{ item: i('Rune kiteshield'), lvl: 50 },
		{ item: i('Granite shield'), lvl: 55 },
		{ item: i('Dragon kiteshield'), lvl: 60 },
		{
			item: i('Black kiteshield'),
			lvl: 25
		},
		{ item: i('Black kiteshield (g)'), lvl: 25 },
		{ item: i('Black kiteshield (t)'), lvl: 25 },
		{
			item: i('Black shield (h1)'),
			lvl: 25
		},
		{
			item: i('Black shield (h2)'),
			lvl: 25
		},
		{
			item: i('Black shield (h3)'),
			lvl: 25
		},
		{
			item: i('Black shield (h4)'),
			lvl: 25
		},
		{
			item: i('Black shield (h5)'),
			lvl: 25
		},
		{
			item: i('Black sq shield'),
			lvl: 25
		},
		{
			item: i('White kiteshield'),
			lvl: 25
		},
		{
			item: i('White sq shield'),
			lvl: 25
		},
		{ item: i('Rune kiteshield (g)'), lvl: 50 },
		{ item: i('Rune kiteshield (t)'), lvl: 50 },
		{
			item: i('Rune shield (h1)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h2)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h3)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h4)'),
			lvl: 50
		},
		{
			item: i('Rune shield (h5)'),
			lvl: 50
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
				parts: [{ type: 'crystal', chance: 74, amount: 8 }]
			}
		},
		{
			item: i('Dragonfire shield'),
			lvl: 70
		},
		{ item: i('Bronze kiteshield'), lvl: 1 },
		{ item: i('Iron kiteshield'), lvl: 10 },
		{ item: i('Steel kiteshield'), lvl: 20 },
		{ item: i('Mithril kiteshield'), lvl: 30 },
		{ item: i('Rune kiteshield'), lvl: 50 },
		{ item: i('Granite shield'), lvl: 55 },
		{ item: i('Dragon kiteshield'), lvl: 60 },
		{ item: i('3rd age kiteshield'), lvl: 65, flags: ['third_age'] }
	],
	parts: { cover: 35, base: 30, strong: 3, protective: 32 }
};
