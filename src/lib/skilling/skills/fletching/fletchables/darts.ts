import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const Darts: Fletchable[] = [
	{
		name: 'Bronze dart',
		id: itemID('Bronze dart'),
		level: 10,
		xp: 1.8,
		inputItems: new Bank({ 'Bronze dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Iron dart',
		id: itemID('Iron dart'),
		level: 22,
		xp: 3.8,
		inputItems: new Bank({ 'Iron dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Steel dart',
		id: itemID('Steel dart'),
		level: 37,
		xp: 7.5,
		inputItems: new Bank({ 'Steel dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Mithril dart',
		id: itemID('Mithril dart'),
		level: 52,
		xp: 11.2,
		inputItems: new Bank({ 'Mithril dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Adamant dart',
		id: itemID('Adamant dart'),
		level: 67,
		xp: 15,
		inputItems: new Bank({ 'Adamant dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Rune dart',
		id: itemID('Rune dart'),
		level: 81,
		xp: 18.8,
		inputItems: new Bank({ 'Rune dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Amethyst dart',
		id: itemID('Amethyst dart'),
		level: 90,
		xp: 21,
		inputItems: new Bank({ 'Amethyst dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Dragon dart',
		id: itemID('Dragon dart'),
		level: 95,
		xp: 25,
		inputItems: new Bank({ 'Dragon dart tip': 1, Feather: 1 }),
		tickRate: 0.08
	}
];

export default Darts;
