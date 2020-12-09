import { ItemBank } from '../types';
import itemID from '../util/itemID';

interface TitheFarmBuyable {
	name: string;
	outputItems: ItemBank;
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
		titheFarmPoints: 75
	},
	{
		name: `Farmer's jacket`,
		aliases: ['farmers jacket'],
		outputItems: {
			[itemID(`Farmer's jacket`)]: 1
		},
		titheFarmPoints: 150
	},
	{
		name: `Farmer's shirt`,
		aliases: ['farmers shirt'],
		outputItems: {
			[itemID(`Farmer's shirt`)]: 1
		},
		titheFarmPoints: 150
	},
	{
		name: `Farmer's boro trousers`,
		aliases: ['farmers trousers', 'farmers bottoms', `farmers legs`],
		outputItems: {
			[itemID(`Farmer's boro trousers`)]: 1
		},
		titheFarmPoints: 125
	},
	{
		name: `Farmer's boots`,
		aliases: ['farmers boots'],
		outputItems: {
			[itemID(`Farmer's boots`)]: 1
		},
		titheFarmPoints: 50
	},
	{
		name: `Grape seed`,
		aliases: ['grape seeds'],
		outputItems: {
			[itemID(`Grape seed`)]: 1
		},
		titheFarmPoints: 2
	},
	{
		name: `Supercompost`,
		aliases: ['super compost'],
		outputItems: {
			[itemID(`Supercompost`)]: 1
		},
		titheFarmPoints: 5
	}
];

export default TitheFarmBuyables;
