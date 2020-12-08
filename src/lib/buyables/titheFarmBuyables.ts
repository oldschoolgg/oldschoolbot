import { Bank } from '../types';
import { resolveNameBank } from '../util';
import itemID from '../util/itemID';

interface TitheFarmBuyable {
	name: string;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
	titheFarmPoints: number;
	aliases?: string[];
}

const TitheFarmBuyables: TitheFarmBuyable[] = [
{
	name: `Farmer's strawhat`,
	aliases: ['farmers strawhat', 'farmers hat'],
	outputItems: {
		[itemID(`Farmer's strawhat`)]: 1
	},
	qpRequired: 0,
	gpCost: 0,
	titheFarmPoints: 75
},
{
	name: `Farmer's jacket`,
	aliases: ['farmers jacket'],
	outputItems: {
		[itemID(`Farmer's jacket`)]: 1
	},
	qpRequired: 0,
	gpCost: 0,
	titheFarmPoints: 150
},
{
	name: `Farmer's shirt`,
	aliases: ['farmers shirt'],
	outputItems: {
		[itemID(`Farmer's shirt`)]: 1
	},
	qpRequired: 0,
	gpCost: 0,
	titheFarmPoints: 150
},
{
	name: `Farmer's boro trousers`,
	aliases: ['farmers trousers', 'farmers bottoms', `farmers legs`],
	outputItems: {
		[itemID(`Farmer's boro trousers`)]: 1
	},
	qpRequired: 0,
	gpCost: 0,
	titheFarmPoints: 125
},
{
	name: `Farmer's boots`,
	aliases: ['farmers boots'],
	outputItems: {
		[itemID(`Farmer's boots`)]: 1
	},
	qpRequired: 0,
	gpCost: 0,
	titheFarmPoints: 50
}
]

export default TitheFarmBuyables;
