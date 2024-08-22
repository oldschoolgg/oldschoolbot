import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const caCreatables: Createable[] = [
	{
		name: 'Tztok slayer helmet',
		inputItems: new Bank().add('Slayer helmet'),
		outputItems: new Bank().add('Tztok slayer helmet'),
		customReq: async user => {
			if (!user.hasCompletedCATier('elite')) {
				return 'You need to complete the Elite tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Tztok slayer helmet',
		outputItems: new Bank().add('Slayer helmet'),
		inputItems: new Bank().add('Tztok slayer helmet'),
		noCl: true
	},
	{
		name: 'Tztok slayer helmet (i)',
		inputItems: new Bank().add('Slayer helmet (i)'),
		outputItems: new Bank().add('Tztok slayer helmet (i)'),
		customReq: async user => {
			if (!user.hasCompletedCATier('elite')) {
				return 'You need to complete the Elite tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Tztok slayer helmet (i)',
		outputItems: new Bank().add('Slayer helmet (i)'),
		inputItems: new Bank().add('Tztok slayer helmet (i)'),
		noCl: true
	},
	//
	{
		name: 'Dragon hunter crossbow (t)',
		inputItems: new Bank().add('Dragon hunter crossbow').add("Vorkath's head"),
		outputItems: new Bank().add('Dragon hunter crossbow (t)'),
		customReq: async user => {
			if (!user.hasCompletedCATier('elite')) {
				return 'You need to complete the Elite tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Dragon hunter crossbow (t)',
		outputItems: new Bank().add('Dragon hunter crossbow').add("Vorkath's head"),
		inputItems: new Bank().add('Dragon hunter crossbow (t)'),
		noCl: true
	},
	//
	{
		name: 'Dragon hunter crossbow (b)',
		inputItems: new Bank().add('Dragon hunter crossbow').add('Kbd heads'),
		outputItems: new Bank().add('Dragon hunter crossbow (b)'),
		customReq: async user => {
			if (!user.hasCompletedCATier('hard')) {
				return 'You need to complete the Hard tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Dragon hunter crossbow (b)',
		outputItems: new Bank().add('Dragon hunter crossbow').add('Kbd heads'),
		inputItems: new Bank().add('Dragon hunter crossbow (b)'),
		noCl: true
	},
	//
	{
		name: 'Tzkal slayer helmet',
		inputItems: new Bank().add('Slayer helmet'),
		outputItems: new Bank().add('Tzkal slayer helmet'),
		customReq: async user => {
			if (!user.hasCompletedCATier('grandmaster')) {
				return 'You need to complete the Grandmaster tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Tzkal slayer helmet',
		outputItems: new Bank().add('Slayer helmet'),
		inputItems: new Bank().add('Tzkal slayer helmet'),
		noCl: true
	},
	{
		name: 'Tzkal slayer helmet (i)',
		inputItems: new Bank().add('Slayer helmet (i)'),
		outputItems: new Bank().add('Tzkal slayer helmet (i)'),
		customReq: async user => {
			if (!user.hasCompletedCATier('grandmaster')) {
				return 'You need to complete the Grandmaster tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Tzkal slayer helmet (i)',
		outputItems: new Bank().add('Slayer helmet (i)'),
		inputItems: new Bank().add('Tzkal slayer helmet (i)'),
		noCl: true
	},
	//
	{
		name: 'Vampyric slayer helmet',
		inputItems: new Bank().add('Slayer helmet'),
		outputItems: new Bank().add('Vampyric slayer helmet'),
		customReq: async user => {
			if (!user.hasCompletedCATier('master')) {
				return 'You need to complete the Master tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Vampyric slayer helmet',
		outputItems: new Bank().add('Slayer helmet'),
		inputItems: new Bank().add('Vampyric slayer helmet'),
		noCl: true
	},
	{
		name: 'Vampyric slayer helmet (i)',
		inputItems: new Bank().add('Slayer helmet (i)'),
		outputItems: new Bank().add('Vampyric slayer helmet (i)'),
		customReq: async user => {
			if (!user.hasCompletedCATier('master')) {
				return 'You need to complete the Master tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: 'Revert Vampyric slayer helmet (i)',
		outputItems: new Bank().add('Slayer helmet (i)'),
		inputItems: new Bank().add('Vampyric slayer helmet (i)'),
		noCl: true
	},
	//
	{
		name: "Ghommal's avernic defender 5",
		inputItems: new Bank().add('Avernic defender').add("Ghommal's hilt 5"),
		outputItems: new Bank().add("Ghommal's avernic defender 5"),
		customReq: async user => {
			if (!user.hasCompletedCATier('master')) {
				return 'You need to complete the Master tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: "Revert Ghommal's avernic defender 5",
		outputItems: new Bank().add('Avernic defender').add("Ghommal's hilt 5"),
		inputItems: new Bank().add("Ghommal's avernic defender 5"),
		noCl: true
	},
	//
	{
		name: "Ghommal's avernic defender 6",
		inputItems: new Bank().add('Avernic defender').add("Ghommal's hilt 6"),
		outputItems: new Bank().add("Ghommal's avernic defender 6"),
		customReq: async user => {
			if (!user.hasCompletedCATier('grandmaster')) {
				return 'You need to complete the Grandmaster tier of the Combat Achievements to create this item.';
			}
			return null;
		}
	},
	{
		name: "Revert Ghommal's avernic defender 6",
		outputItems: new Bank().add('Avernic defender').add("Ghommal's hilt 6"),
		inputItems: new Bank().add("Ghommal's avernic defender 6"),
		noCl: true
	}
];
