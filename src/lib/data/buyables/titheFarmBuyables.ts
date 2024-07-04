import type { ItemBank } from '../../types';
import itemID from '../../util/itemID';

interface TitheFarmBuyable {
	name: string;
	outputItems: ItemBank;
	titheFarmPoints: number;
	aliases?: string[];
}

const TitheFarmBuyables: TitheFarmBuyable[] = [
	{
		name: "Farmer's strawhat",
		aliases: ['farmers strawhat', 'farmers hat'],
		outputItems: {
			[itemID("Farmer's strawhat")]: 1
		},
		titheFarmPoints: 75
	},
	{
		name: "Farmer's jacket",
		aliases: ['farmers jacket'],
		outputItems: {
			[itemID("Farmer's jacket")]: 1
		},
		titheFarmPoints: 150
	},
	{
		name: "Farmer's shirt",
		aliases: ['farmers shirt'],
		outputItems: {
			[itemID("Farmer's shirt")]: 1
		},
		titheFarmPoints: 150
	},
	{
		name: "Farmer's boro trousers",
		aliases: ['farmers trousers', 'farmers bottoms', 'farmers legs'],
		outputItems: {
			[itemID("Farmer's boro trousers")]: 1
		},
		titheFarmPoints: 125
	},
	{
		name: "Farmer's boots",
		aliases: ['farmers boots'],
		outputItems: {
			[itemID("Farmer's boots")]: 1
		},
		titheFarmPoints: 50
	},
	{
		name: 'Seed box',
		outputItems: {
			[itemID('Seed box')]: 1
		},
		titheFarmPoints: 250
	},
	{
		name: "Gricoller's can",
		aliases: ['can', 'gricollers can'],
		outputItems: {
			[itemID("Gricoller's can")]: 1
		},
		titheFarmPoints: 200
	},
	{
		name: 'Herb sack',
		outputItems: {
			[itemID('Herb sack')]: 1
		},
		titheFarmPoints: 250
	},
	{
		name: 'Grape seed',
		aliases: ['grape seeds'],
		outputItems: {
			[itemID('Grape seed')]: 1
		},
		titheFarmPoints: 2
	},
	{
		name: '20x Grape seed',
		aliases: ['20x grape seeds'],
		outputItems: {
			[itemID('Grape seed')]: 20
		},
		titheFarmPoints: 40
	},
	{
		name: 'Supercompost',
		aliases: ['super compost'],
		outputItems: {
			[itemID('Supercompost')]: 1
		},
		titheFarmPoints: 5
	},
	{
		name: "Bologa's blessing",
		aliases: ['bologa'],
		outputItems: {
			[itemID("Bologa's blessing")]: 10
		},
		titheFarmPoints: 1
	}
];

export default TitheFarmBuyables;
