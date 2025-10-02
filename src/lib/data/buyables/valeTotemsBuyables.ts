import { Bank } from 'oldschooljs';

interface ValeTotemsBuyable {
	name: string;
	output: Bank;
	valeResearchPoints: number;
	aliases?: string[];
	ironman?: boolean;
}

export const ValeTotemsBuyables: ValeTotemsBuyable[] = [
	{
		name: 'Bow string spool',
		aliases: ['string spool', 'spool'],
		output: new Bank().add('Bow string spool', 1),
		valeResearchPoints: 250
	},
	{
		name: 'Fletching knife',
		aliases: ['fletching knife'],
		output: new Bank().add('Fletching knife', 1),
		valeResearchPoints: 350
	},
	{
		name: 'Greenman mask',
		aliases: ['mask'],
		output: new Bank().add('Greenman mask', 1),
		valeResearchPoints: 500
	},
	{
		name: 'Ent branch',
		output: new Bank().add('Ent branch', 1),
		valeResearchPoints: 20
	}
];

export const ValeTotemsSellables: ValeTotemsBuyable[] = [
	{
		name: 'Bow string spool',
		aliases: ['string spool', 'spool'],
		output: new Bank().add('Bow string spool', 1),
		valeResearchPoints: 125
	},
	{
		name: 'Fletching knife',
		aliases: ['fletching knife'],
		output: new Bank().add('Fletching knife', 1),
		valeResearchPoints: 175
	},
	{
		name: 'Greenman mask',
		aliases: ['mask'],
		output: new Bank().add('Greenman mask', 1),
		valeResearchPoints: 125,
		ironman: true
	}
];
