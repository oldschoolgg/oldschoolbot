import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GEListingType } from '@prisma/client';
import { EItem } from 'oldschooljs';
import { describe, test } from 'vitest';

import { GeImageGenerator } from '@/lib/canvas/geImage.js';
import { baseSnapshotPath } from '../../testConstants.js';

describe('GE Images', async () => {
	await GeImageGenerator.init();

	test('Basic GE Image', async () => {
		const geImage = await GeImageGenerator.createInterface({
			slotsUsed: 2,
			maxSlots: 8,
			page: 1,
			activeListings: [],
			user: undefined
		});
		await writeFile(path.join(baseSnapshotPath, 'ge-no-listings.png'), geImage);
	});

	const geImage = await GeImageGenerator.createInterface({
		slotsUsed: 8,
		maxSlots: 8,
		page: 1,
		activeListings: [
			{
				item_id: EItem.TWISTED_BOW,
				type: GEListingType.Sell,
				quantity_remaining: 100,
				total_quantity: 100,
				asking_price_per_item: 1000000
			},
			{
				item_id: EItem.TWISTED_BOW,
				type: GEListingType.Buy,
				quantity_remaining: 50,
				total_quantity: 100,
				asking_price_per_item: 1000000
			},
			{
				item_id: EItem.EGG,
				type: GEListingType.Sell,
				quantity_remaining: 0,
				total_quantity: 1001,
				asking_price_per_item: 10000
			},
			{
				item_id: EItem.EGG,
				type: GEListingType.Sell,
				quantity_remaining: 100,
				total_quantity: 1001,
				asking_price_per_item: 10000
			},
			{
				item_id: EItem.ELYSIAN_SPIRIT_SHIELD,
				type: GEListingType.Sell,
				quantity_remaining: 602,
				total_quantity: 1001,
				asking_price_per_item: 10000
			},
			{
				item_id: EItem.ELYSIAN_SPIRIT_SHIELD,
				type: GEListingType.Sell,
				quantity_remaining: 100,
				total_quantity: 1001,
				asking_price_per_item: 10000
			},
			{
				item_id: EItem.BANANA,
				type: GEListingType.Buy,
				quantity_remaining: 1,
				total_quantity: 1,
				asking_price_per_item: 1_111_111_111_111
			}
		] as any
	});
	await writeFile(path.join(baseSnapshotPath, 'ge-basic1.png'), geImage);
});
