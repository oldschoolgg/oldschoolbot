import { Createable } from '.';
import itemID from '../util/itemID';

const Crafting: Createable[] = [
	{
		name: 'Small pouch',
		inputItems: {
			[itemID('Leather')]: 10
		},
		outputItems: {
			[itemID('Small pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Small pouch')]: 1
		}
	},
	{
		name: 'Medium pouch',
		inputItems: {
			[itemID('Leather')]: 20
		},
		outputItems: {
			[itemID('Medium pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Medium pouch')]: 1
		},
		craftingLevel: 10
	},
	{
		name: 'Large pouch',
		inputItems: {
			[itemID('Leather')]: 30
		},
		outputItems: {
			[itemID('Large pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Large pouch')]: 1
		},
		craftingLevel: 20
	},
	{
		name: 'Giant pouch',
		inputItems: {
			[itemID('Leather')]: 40
		},
		outputItems: {
			[itemID('Giant pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Giant pouch')]: 1
		},
		craftingLevel: 30
	},
	{
		name: 'Toxic staff of the dead',
		inputItems: {
			[itemID('Toxic staff (uncharged)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		},
		outputItems: {
			[itemID('Toxic staff of the dead')]: 1
		}
	},
	{
		name: 'Toxic staff (uncharged)',
		inputItems: {
			[itemID('Toxic staff of the dead')]: 1
		},
		outputItems: {
			[itemID('Toxic staff (uncharged)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		}
	},
	{
		name: 'Serpentine helm',
		inputItems: {
			[itemID('Serpentine helm (uncharged)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		},
		outputItems: {
			[itemID('Serpentine helm')]: 1
		}
	},
	{
		name: 'Serpentine helm (uncharged)',
		inputItems: {
			[itemID('Serpentine helm')]: 1
		},
		outputItems: {
			[itemID('Serpentine helm (uncharged)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		}
	},
	{
		name: 'Magma helm',
		inputItems: {
			[itemID('Serpentine helm')]: 1,
			[itemID('Magma mutagen')]: 1
		},
		outputItems: {
			[itemID('Magma helm')]: 1
		}
	},
	{
		name: 'Tanzanite helm',
		inputItems: {
			[itemID('Serpentine helm')]: 1,
			[itemID('Tanzanite mutagen')]: 1
		},
		outputItems: {
			[itemID('Tanzanite helm')]: 1
		}
	},
	{
		name: 'Toxic blowpipe (empty)',
		inputItems: {
			[itemID('Toxic blowpipe')]: 1
		},
		outputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		}
	},
	{
		name: 'Toxic blowpipe',
		inputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		},
		outputItems: {
			[itemID('Toxic blowpipe')]: 1
		}
	}
];

export default Crafting;
