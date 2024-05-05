import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

export const carapaceCraftables: Craftable[] = [
	{
		name: 'Carapace gloves',
		id: itemID('Carapace gloves'),
		level: 11,
		xp: 23.8,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace boots',
		id: itemID('Carapace boots'),
		level: 15,
		xp: 26.2,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace helm',
		id: itemID('Carapace helm'),
		level: 22,
		xp: 28.5,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace gloves',
		id: itemID('Carapace gloves'),
		level: 32,
		xp: 32,
		inputItems: new Bank({ Carapace: 1 }),
		tickRate: 3
	},
	{
		name: 'Carapace torso',
		id: itemID('Carapace torso'),
		level: 35,
		xp: 35,
		inputItems: new Bank({ Carapace: 3 }),
		tickRate: 3
	},
	{
		name: 'Carapace legs',
		id: itemID('Carapace legs'),
		level: 44,
		xp: 37,
		inputItems: new Bank({ Carapace: 3 }),
		tickRate: 3
	}
];
