import { Bank } from 'oldschooljs';

import { itemID, resolveNameBank } from '../../util';
import { Createable } from '../createables';

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
		requiredSkills: { smithing: 90 }
	},
	// Charged
	{
		name: 'Dragonfire shield',
		inputItems: new Bank({
			'Bottled dragonbreath': 5,
			'Uncharged dragonfire shield': 1
		}).bank,
		outputItems: resolveNameBank({
			'Dragonfire shield': 1
		}),
		requiredSkills: {
			slayer: 62
		}
	},
	{
		name: 'Dragonfire ward',
		inputItems: new Bank({
			'Bottled dragonbreath': 5,
			'Uncharged dragonfire ward': 1
		}).bank,
		outputItems: resolveNameBank({
			'Dragonfire ward': 1
		})
	},
	{
		name: 'Ancient wyvern shield',
		inputItems: new Bank({
			'Bottled dragonbreath': 5,
			Numulite: 5000,
			'Uncharged ancient wyvern shield': 1
		}).bank,
		outputItems: resolveNameBank({
			'Ancient wyvern shield': 1
		})
	}
];
