import { Bank } from 'oldschooljs';

import itemID from '../../util/itemID';
import type { Createable } from '../createables';

export const dragonFireShieldCreatables: Createable[] = [
	// Uncharged
	{
		name: 'Uncharged dragonfire shield',
		inputItems: {
			[itemID('Draconic visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			'Uncharged dragonfire shield': 1
		},
		requiredSkills: { smithing: 90 }
	},
	{
		name: 'Uncharged dragonfire ward',
		inputItems: {
			[itemID('Skeletal visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			'Uncharged dragonfire ward': 1
		},
		requiredSkills: { smithing: 90 }
	},
	{
		name: 'Uncharged ancient wyvern shield',
		inputItems: {
			[itemID('Wyvern visage')]: 1,
			[itemID('Elemental shield')]: 1
		},
		outputItems: {
			'Uncharged ancient wyvern shield': 1
		},
		requiredSkills: { smithing: 66, magic: 66 }
	},
	// Charged
	{
		name: 'Dragonfire shield',
		inputItems: new Bank({
			'Bottled dragonbreath': 1,
			'Uncharged dragonfire shield': 1
		}),
		outputItems: new Bank({
			'Dragonfire shield': 1
		})
	},
	{
		name: 'Dragonfire ward',
		inputItems: new Bank({
			'Bottled dragonbreath': 1,
			'Uncharged dragonfire ward': 1
		}),
		outputItems: new Bank({
			'Dragonfire ward': 1
		})
	},
	{
		name: 'Ancient wyvern shield',
		inputItems: new Bank({
			'Bottled dragonbreath': 1,
			Numulite: 5000,
			'Uncharged ancient wyvern shield': 1
		}),
		outputItems: new Bank({
			'Ancient wyvern shield': 1
		})
	}
];
