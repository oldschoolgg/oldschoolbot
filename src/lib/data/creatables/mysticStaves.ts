import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const mysticStavesCreatables: Createable[] = [
	{
		name: 'Mystic air staff',
		inputItems: new Bank({
			'Air battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic air staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic water staff',
		inputItems: new Bank({
			'Water battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic water staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic earth staff',
		inputItems: new Bank({
			'Earth battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic earth staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic fire staff',
		inputItems: new Bank({
			'Fire battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic fire staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic dust staff',
		inputItems: new Bank({
			'Dust battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic dust staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic lava staff',
		inputItems: new Bank({
			'Lava battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic lava staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic lava staff (or)',
		inputItems: new Bank({
			'Lava battlestaff (or)': 1
		}),
		outputItems: new Bank({ 'Mystic lava staff (or)': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic mist staff',
		inputItems: new Bank({
			'Mist battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic mist staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic mud staff',
		inputItems: new Bank({
			'Mud battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic mud staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic smoke staff',
		inputItems: new Bank({
			'Smoke battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic smoke staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic steam staff',
		inputItems: new Bank({
			'Steam battlestaff': 1
		}),
		outputItems: new Bank({ 'Mystic steam staff': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	},
	{
		name: 'Mystic steam staff (or)',
		inputItems: new Bank({
			'Steam battlestaff (or)': 1
		}),
		outputItems: new Bank({ 'Mystic steam staff (or)': 1 }),
		GPCost: 40_000,
		QPRequired: 1,
		requiredSkills: { prayer: 31 }
	}
];
