import getOSItem from '../util/getOSItem';
import type { SlayerShopItem } from './types';

export const slayerShopBuy: readonly SlayerShopItem[] = [
	{
		item: getOSItem('Slayer ring (8)'),
		itemAmount: 1,
		points: 75
	},
	{
		item: getOSItem('Broad bolts'),
		itemAmount: 250,
		points: 35
	},
	{
		item: getOSItem('Broad arrows'),
		itemAmount: 250,
		points: 35
	},
	{
		item: getOSItem('Herb sack'),
		itemAmount: 1,
		points: 750
	},
	{
		item: getOSItem('Rune pouch'),
		itemAmount: 1,
		points: 750
	}
] as const;
