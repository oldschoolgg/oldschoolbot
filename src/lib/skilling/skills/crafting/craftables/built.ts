import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Built: Craftable[] = [
	{
		name: 'Serpentine helm (uncharged)',
		id: itemID('Serpentine helm (uncharged)'),
		level: 52,
		xp: 120,
		inputItems: resolveNameBank({ 'Serpentine visage': 1 }),
		tickRate: 3
	},
	{
		name: 'Slayer helmet',
		id: itemID('Slayer helmet'),
		level: 55,
		xp: 0,
		inputItems: resolveNameBank({
			'Black mask': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		tickRate: 3
	},
	{
		name: 'Toxic staff (uncharged)',
		id: itemID('Toxic staff (uncharged)'),
		level: 59,
		xp: 0,
		inputItems: resolveNameBank({ 'Staff of the dead': 1, 'Magic fang': 1 }),
		tickRate: 3
	},
	{
		name: 'Uncharged toxic trident',
		id: itemID('Uncharged toxic trident'),
		level: 59,
		xp: 0,
		inputItems: resolveNameBank({ 'Uncharged trident': 1, 'Magic fang': 1 }),
		tickRate: 3
	}
];

export default Built;
