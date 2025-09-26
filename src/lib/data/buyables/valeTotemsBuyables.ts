import { type ItemBank, itemID } from 'oldschooljs';

interface ValeTotemsBuyable {
	name: string;
	outputItems: ItemBank;
	valeResearchPoints: number;
	aliases?: string[];
    ironman?: boolean;
}

export const ValeTotemsBuyables: ValeTotemsBuyable[] = [
	{
		name: 'Bow string spool',
        aliases: ['string spool', 'spool'],
		outputItems: {
			[itemID("Bow string spool")]: 1
		},
        valeResearchPoints: 250
	},
	{
		name: 'Fletching knife',
		aliases: ['fletching knife'],
		outputItems: {
			[itemID("Fletching knife")]: 1
		},
        valeResearchPoints: 350
	},
	{
		name: 'Greenman mask',
		outputItems: {
			[itemID("Greenman mask")]: 1
		},
        valeResearchPoints: 500
	},
	{
		name: 'Ent branch',
		outputItems: {
			[itemID("Ent branch")]: 1
		},
        valeResearchPoints: 20
	}
];

export const ValeTotemsSellables: ValeTotemsBuyable[] = [
	{
		name: 'Bow string spool',
        aliases: ['string spool', 'spool'],
		outputItems: {
			[itemID("Bow string spool")]: 1
		},
        valeResearchPoints: 125
	},
	{
		name: 'Fletching knife',
		aliases: ['fletching knife'],
		outputItems: {
			[itemID("Fletching knife")]: 1
		},
        valeResearchPoints: 175
	},
	{
		name: 'Greenman mask',
		outputItems: {
			[itemID("Greenman mask")]: 1
		},
        valeResearchPoints: 125,
        ironman: true
	}
];