import { Items } from 'oldschooljs';

import type { SlayerShopItem } from './types.js';

export const slayerShopBuy: readonly SlayerShopItem[] = [
	{
		item: Items.getOrThrow('Slayer ring (8)'),
		itemAmount: 1,
		points: 75
	},
	{
		item: Items.getOrThrow('Broad bolts'),
		itemAmount: 250,
		points: 35
	},
	{
		item: Items.getOrThrow('Broad arrows'),
		itemAmount: 250,
		points: 35
	},
	{
		item: Items.getOrThrow('Herb sack'),
		itemAmount: 1,
		points: 750
	},
	{
		item: Items.getOrThrow('Rune pouch'),
		itemAmount: 1,
		points: 750
	}
] as const;
