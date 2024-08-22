import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Craftable } from '../../../types';

const Built: Craftable[] = [
	{
		name: 'Serpentine helm (uncharged)',
		id: itemID('Serpentine helm (uncharged)'),
		level: 52,
		xp: 120,
		inputItems: new Bank({ 'Serpentine visage': 1 }),
		tickRate: 3
	},
	{
		name: 'Toxic staff (uncharged)',
		id: itemID('Toxic staff (uncharged)'),
		level: 59,
		xp: 0,
		inputItems: new Bank({ 'Staff of the dead': 1, 'Magic fang': 1 }),
		tickRate: 3
	},
	{
		name: 'Uncharged toxic trident',
		id: itemID('Uncharged toxic trident'),
		level: 59,
		xp: 0,
		inputItems: new Bank({ 'Uncharged trident': 1, 'Magic fang': 1 }),
		tickRate: 3
	}
];

export default Built;
