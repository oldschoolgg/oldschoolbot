import itemID from '../util/itemID';
import { Bank } from '../types';

interface Createable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	smithingLevel?: number;
	addOutputToCollectionLog?: boolean;
	cantHaveItems: Bank;
	firemakingLevel?: number;
	craftingLevel?: number;
	prayerLevel?: number;
}
const Prayer: Createable[] = [
	{
		name: 'Blessed spirit shield',
		inputItems: {
			[itemID('Spirit shield')]: 1,
			[itemID('Holy elixir')]: 1
		},
		outputItems: {
			[itemID('Blessed spirit shield')]: 1
		},
		prayerLevel: 85,
		cantHaveItems: {}
	},
	{
		name: 'Spectral spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Spectral sigil')]: 1
		},
		outputItems: {
			[itemID('Spectral spirit shield')]: 1
		},
		prayerLevel: 90,
		smithingLevel: 85,
		cantHaveItems: {}
	},
	{
		name: 'Arcane spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Arcane sigil')]: 1
		},
		outputItems: {
			[itemID('Arcane spirit shield')]: 1
		},
		prayerLevel: 90,
		smithingLevel: 85,
		cantHaveItems: {}
	},
	{
		name: 'Elysian spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Elysian sigil')]: 1
		},
		outputItems: {
			[itemID('Elysian spirit shield')]: 1
		},
		prayerLevel: 90,
		smithingLevel: 85,
		cantHaveItems: {}
	}
];

export default Prayer;
