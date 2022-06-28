import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [
		{ item: ['Fremennik shield', 'Bronze kiteshield (g)', 'Bronze kiteshield (t)'].map(i), lvl: 1 },
		{
			item: i('Black kiteshield'),
			lvl: 25
		},
		{ item: i('Black kiteshield (g)'), lvl: 25 },
		{ item: i('Black kiteshield (t)'), lvl: 25 },
		{
			item: [
				'Black shield (h1)',
				'Black shield (h2)',
				'Black shield (h3)',
				'Black shield (h4)',
				'Black shield (h5)'
			].map(i),
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
		{
			item: [
				'Rune kiteshield (t)',
				'Rune kiteshield (g)',
				'Ancient kiteshield',
				'Rune shield (h1)',
				'Rune shield (h2)',
				'Rune shield (h3)',
				'Rune shield (h4)',
				'Rune shield (h5)',
				'Rune sq shield'
			].map(i),
			lvl: 50
		},
		{ item: i('Spirit shield'), lvl: 55 },
		{
			item: [
				'Adamant sq shield',
				'Adamant shield (h1)',
				'Adamant shield (h3)',
				'Adamant shield (h4)',
				'Adamant shield (h5)',
				'Adamant kiteshield',
				'Adamant kiteshield (g)',
				'Adamant kiteshield (t)'
			].map(i),
			lvl: 30
		},
		{ item: i('Dragon sq shield'), lvl: 60 },
		{ item: i('Toktz-ket-xil'), lvl: 60 },

		{
			item: i('Crystal shield'),
			lvl: 70
		},
		{
			item: i('Dragonfire shield'),
			lvl: 70
		},
		{ item: i('Bronze kiteshield'), lvl: 1 },
		{ item: i('Iron kiteshield'), lvl: 10 },
		{ item: ['Steel kiteshield', 'Steel sq shield', 'Steel kiteshield (t)'].map(i), lvl: 20 },
		{
			item: ['Mithril kiteshield', 'Mithril kiteshield (g)', 'Mithril kiteshield (t)', 'Mithril sq shield'].map(
				i
			),
			lvl: 30
		},
		{ item: i('Rune kiteshield'), lvl: 50 },
		{ item: i('Granite shield'), lvl: 55 },
		{ item: i('Dragon kiteshield'), lvl: 70, flags: new Set(['orikalkum']) },
		{ item: i('Divine spirit shield'), lvl: 99, flags: new Set(['corporeal']) }
	],
	parts: { strong: 30, protective: 30 }
};
