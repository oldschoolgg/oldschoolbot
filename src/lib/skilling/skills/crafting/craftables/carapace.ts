import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Craftable } from '../../../types';

export const carapaceCraftables: Craftable[] = [
	{
		name: 'Carapace helm',
		id: itemID('Carapace helm'),
		level: 33,
		xp: 24,
		inputItems: new Bank({ Carapace: 2 }),
		tickRate: 3
	},
	{
		name: 'Carapace torso',
		id: itemID('Carapace torso'),
		level: 35,
		xp: 36,
		inputItems: new Bank({ Carapace: 3 }),
		tickRate: 3
	},
	{
		name: 'Carapace legs',
		id: itemID('Carapace legs'),
		level: 34,
		xp: 24,
		inputItems: new Bank({ Carapace: 2 }),
		tickRate: 3
	},
	{
		name: 'Carapace boots',
		id: itemID('Carapace boots'),
		level: 31,
		xp: 12,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace gloves',
		id: itemID('Carapace gloves'),
		level: 30,
		xp: 12,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace shield',
		id: itemID('Carapace shield'),
		level: 36,
		xp: 36,
		inputItems: new Bank({ Carapace: 3 }),
		tickRate: 3
	}
];
