import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Mixes: Mixable[] = [
	{
		name: 'Attack mix(2)',
		aliases: ['attack mix roe', 'attack mix(2)', 'attack mix 2 roe'],
		id: itemID('Attack mix(2)'),
		level: 4,
		xp: 8,
		inputItems: new Bank({
			'Attack Potion(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Strength mix(2)',
		aliases: ['str mix(2)', 'strength mix(2)', 'strength mix roe'],
		id: itemID('Strength mix(2)'),
		level: 14,
		xp: 17,
		inputItems: new Bank({
			'Strength potion(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Restore mix(2)',
		aliases: ['restore mix(2)', 'restore mix', 'restore mix roe'],
		id: itemID('Restore mix(2)'),
		level: 24,
		xp: 21,
		inputItems: new Bank({
			'Restore potion(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Restore mix(2)',
		aliases: ['restore mix(2)', 'restore mix', 'restore mix roe'],
		id: itemID('Restore mix(2)'),
		level: 24,
		xp: 21,
		inputItems: new Bank({
			'Restore potion(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Energy mix(2)',
		aliases: ['energy mix(2)', 'energy mix', 'energy mix caviar'],
		id: itemID('Energy mix(2)'),
		level: 29,
		xp: 23,
		inputItems: new Bank({
			'Energy potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Defence mix(2)',
		aliases: ['defence mix(2)', 'def mix', 'defence mix caviar'],
		id: itemID('Defence mix(2)'),
		level: 33,
		xp: 25,
		inputItems: new Bank({
			'Defence potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Agility mix(2)',
		aliases: ['agility mix(2)', 'agil mix', 'agility mix caviar'],
		id: itemID('Agility mix(2)'),
		level: 37,
		xp: 27,
		inputItems: new Bank({
			'Agility potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Combat mix(2)',
		aliases: ['combat mix(2)', 'cb mix', 'combat mix caviar'],
		id: itemID('Combat mix(2)'),
		level: 40,
		xp: 28,
		inputItems: new Bank({
			'Combat potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Prayer mix(2)',
		aliases: ['prayer mix(2)', 'pray mix', 'prayer mix caviar'],
		id: itemID('Prayer mix(2)'),
		level: 42,
		xp: 29,
		inputItems: new Bank({
			'Prayer potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Superattack mix(2)',
		aliases: ['super attack mix(2)', 'superattack mix', 'superattack mix caviar'],
		id: itemID('Superattack mix(2)'),
		level: 47,
		xp: 33,
		inputItems: new Bank({
			'Super attack(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Anti-poison supermix(2)',
		aliases: ['superantipoison mix(2)', 'superantipoison mix', 'superantipoison mix caviar'],
		id: itemID('Anti-poison supermix(2)'),
		level: 51,
		xp: 35,
		inputItems: new Bank({
			'Superantipoison(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Fishing mix(2)',
		aliases: ['fishing mix(2)', 'fish mix', 'fishing mix caviar'],
		id: itemID('Fishing mix(2)'),
		level: 53,
		xp: 38,
		inputItems: new Bank({
			'Fishing potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Super energy mix(2)',
		aliases: ['super energy mix(2)', 'super energy mix', 'super energy mix caviar'],
		id: itemID('Super energy mix(2)'),
		level: 56,
		xp: 39,
		inputItems: new Bank({
			'Super energy(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Hunting mix(2)',
		aliases: ['hunting mix(2)', 'hunter mix', 'hunting mix caviar'],
		id: itemID('Hunting mix(2)'),
		level: 58,
		xp: 40,
		inputItems: new Bank({
			'Hunter potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Super str. mix(2)',
		aliases: ['super str mix(2)', 'super strength mix', 'super str mix caviar'],
		id: itemID('Super str. mix(2)'),
		level: 59,
		xp: 42,
		inputItems: new Bank({
			'Super strength(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Super restore mix(2)',
		aliases: ['super restore mix(2)', 'super restore mix', 'super restore mix caviar'],
		id: itemID('Super restore mix(2)'),
		level: 67,
		xp: 48,
		inputItems: new Bank({
			'Super restore(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Super def. mix(2)',
		aliases: ['super def mix(2)', 'super def mix', 'super def mix caviar'],
		id: itemID('Super def. mix(2)'),
		level: 71,
		xp: 50,
		inputItems: new Bank({
			'Super defence(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Antidote+ mix(2)',
		aliases: ['antidote+ mix(2)', 'antidote+ mix', 'antidote+ mix caviar'],
		id: itemID('Antidote+ mix(2)'),
		level: 74,
		xp: 52,
		inputItems: new Bank({
			'Antidote+(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Antifire mix(2)',
		aliases: ['antifire mix(2)', 'antifire mix', 'antifire mix caviar'],
		id: itemID('Antifire mix(2)'),
		level: 75,
		xp: 53,
		inputItems: new Bank({
			'Antifire potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Ranging mix(2)',
		aliases: ['ranging mix(2)', 'ranging mix', 'ranging mix caviar'],
		id: itemID('Ranging mix(2)'),
		level: 80,
		xp: 54,
		inputItems: new Bank({
			'Ranging potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Magic mix(2)',
		aliases: ['Magic mix(2)', 'Magic mix', 'Magic mix caviar'],
		id: itemID('Magic mix(2)'),
		level: 83,
		xp: 57,
		inputItems: new Bank({
			'Magic potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Zamorak mix(2)',
		aliases: ['Zamorak mix(2)', 'Zamorak mix', 'Zamorak mix caviar'],
		id: itemID('Zamorak mix(2)'),
		level: 85,
		xp: 58,
		inputItems: new Bank({
			'Zamorak brew(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Stamina mix(2)',
		aliases: ['Stamina mix(2)', 'Stamina mix', 'Stamina mix caviar'],
		id: itemID('Stamina mix(2)'),
		level: 86,
		xp: 60,
		inputItems: new Bank({
			'Stamina potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Extended antifire mix(2)',
		aliases: ['extended antifire mix(2)', 'extended antifire mix', 'extended antifire mix caviar'],
		id: itemID('Extended antifire mix(2)'),
		level: 91,
		xp: 61,
		inputItems: new Bank({
			'Extended antifire(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Ancient mix(2)',
		aliases: ['ancient mix(2)', 'Ancient mix', 'Ancient mix caviar'],
		id: itemID('Ancient mix(2)'),
		level: 92,
		xp: 63,
		inputItems: new Bank({
			'Ancient brew(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Super antifire mix(2)',
		aliases: ['super antifire mix(2)', 'super antifire mix', 'super antifire mix caviar'],
		id: itemID('Super antifire mix(2)'),
		level: 98,
		xp: 70,
		inputItems: new Bank({
			'Super antifire potion(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		name: 'Extended super antifire mix(2)',
		aliases: [
			'extended super antifire mix(2)',
			'extended super antifire mix',
			'extended super antifire mix caviar'
		],
		id: itemID('Extended super antifire mix(2)'),
		level: 99,
		xp: 78,
		inputItems: new Bank({
			'Extended super antifire(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	}
];

export default Mixes;
