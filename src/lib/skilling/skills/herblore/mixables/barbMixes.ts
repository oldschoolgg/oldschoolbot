import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

export const barbMixes: Mixable[] = [
	{
		item: getOSItem('Attack mix (2)'),
		aliases: ['attack mix roe', 'attack mix(2)', 'attack mix 2 roe'],
		level: 4,
		xp: 8,
		inputItems: new Bank({
			'Attack potion(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		item: getOSItem('Antipoison mix(2)'),
		aliases: ['antipoison mix roe', 'antipoison mix(2)', 'antipoison mix 2 roe'],
		level: 4,
		xp: 8,
		inputItems: new Bank({
			'Antipoison(2)': 1,
			Roe: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		item: getOSItem("Relicym's mix(2)"),
		aliases: ['Relicyms mix roe', 'Relicyms mix(2)', 'Relicyms mix 2 roe'],
		level: 9,
		xp: 14,
		inputItems: new Bank().add("Relicym's balm(2)").add('Roe'),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		item: getOSItem('Strength mix(2)'),
		aliases: ['str mix(2)', 'strength mix(2)', 'strength mix roe'],
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
		item: getOSItem('Restore mix(2)'),
		aliases: ['restore mix(2)', 'restore mix', 'restore mix roe'],
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
		item: getOSItem('Energy mix(2)'),
		aliases: ['energy mix(2)', 'energy mix', 'energy mix caviar'],
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
		item: getOSItem('Defence mix(2)'),
		aliases: ['defence mix(2)', 'def mix', 'defence mix caviar'],
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
		item: getOSItem('Agility mix(2)'),
		aliases: ['agility mix(2)', 'agil mix', 'agility mix caviar'],
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
		item: getOSItem('Combat mix(2)'),
		aliases: ['combat mix(2)', 'cb mix', 'combat mix caviar'],
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
		item: getOSItem('Prayer mix(2)'),
		aliases: ['prayer mix(2)', 'pray mix', 'prayer mix caviar'],
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
		item: getOSItem('Superattack mix(2)'),
		aliases: ['super attack mix(2)', 'superattack mix', 'superattack mix caviar'],
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
		item: getOSItem('Anti-poison supermix(2)'),
		aliases: ['superantipoison mix(2)', 'superantipoison mix', 'superantipoison mix caviar'],
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
		item: getOSItem('Fishing mix(2)'),
		aliases: ['fishing mix(2)', 'fish mix', 'fishing mix caviar'],
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
		item: getOSItem('Super energy mix(2)'),
		aliases: ['super energy mix(2)', 'super energy mix', 'super energy mix caviar'],
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
		item: getOSItem('Hunting mix(2)'),
		aliases: ['hunting mix(2)', 'hunter mix', 'hunting mix caviar'],
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
		item: getOSItem('Super str. mix(2)'),
		aliases: ['super str mix(2)', 'super strength mix', 'super str mix caviar'],
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
		item: getOSItem('Magic essence mix(2)'),
		aliases: ['essence mix(2)', 'magic essence mix', 'magic essence mix caviar'],
		level: 61,
		xp: 43,
		inputItems: new Bank({
			'Magic essence(2)': 1,
			Caviar: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.088
	},
	{
		item: getOSItem('Super restore mix(2)'),
		aliases: ['super restore mix(2)', 'super restore mix', 'super restore mix caviar'],
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
		item: getOSItem('Super def. mix(2)'),
		aliases: ['super def mix(2)', 'super def mix', 'super def mix caviar'],
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
		item: getOSItem('Antidote+ mix(2)'),
		aliases: ['antidote+ mix(2)', 'antidote+ mix', 'antidote+ mix caviar'],
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
		item: getOSItem('Antifire mix(2)'),
		aliases: ['antifire mix(2)', 'antifire mix', 'antifire mix caviar'],
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
		item: getOSItem('Ranging mix(2)'),
		aliases: ['ranging mix(2)', 'ranging mix', 'ranging mix caviar'],
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
		item: getOSItem('Magic mix(2)'),
		aliases: ['Magic mix(2)', 'Magic mix', 'Magic mix caviar'],
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
		item: getOSItem('Zamorak mix(2)'),
		aliases: ['Zamorak mix(2)', 'Zamorak mix', 'Zamorak mix caviar'],
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
		item: getOSItem('Stamina mix(2)'),
		aliases: ['Stamina mix(2)', 'Stamina mix', 'Stamina mix caviar'],
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
		item: getOSItem('Extended antifire mix(2)'),
		aliases: ['extended antifire mix(2)', 'extended antifire mix', 'extended antifire mix caviar'],
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
		item: getOSItem('Ancient mix(2)'),
		aliases: ['ancient mix(2)', 'Ancient mix', 'Ancient mix caviar'],
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
		item: getOSItem('Super antifire mix(2)'),
		aliases: ['super antifire mix(2)', 'super antifire mix', 'super antifire mix caviar'],
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
		item: getOSItem('Extended super antifire mix(2)'),
		aliases: [
			'extended super antifire mix(2)',
			'extended super antifire mix',
			'extended super antifire mix caviar'
		],
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
