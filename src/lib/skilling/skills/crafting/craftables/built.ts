import { Craftable } from '../../../types';
import itemID from '../../../../util/itemID';
import { transformStringBankToNum } from '../../../../util/transformStringBankToNum';

const Built: Craftable[] = [
	{
		name: 'Serpentine helmet',
		id: itemID('Serpentine helm (uncharged)'),
		level: 52,
		xp: 120,
		inputItems: transformStringBankToNum({ 'Serpentine visage': 1 }),
		tickRate: 3
	},
	{
		name: 'Slayer helmet',
		id: itemID('Slayer helmet'),
		level: 55,
		xp: 0,
		inputItems: transformStringBankToNum({
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
		name: 'Toxic staff of the dead',
		id: itemID('Toxic staff (uncharged)'),
		level: 59,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Staff of the dead': 1, 'Magic fang': 1 }),
		tickRate: 3
	},
	{
		name: 'Trident of the swamp',
		id: itemID('Uncharged toxic trident'),
		level: 59,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Uncharged trident': 1, 'Magic fang': 1 }),
		tickRate: 3
	}
];

export default Built;
