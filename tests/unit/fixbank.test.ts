import { describe, expect, test } from 'vitest';

import { GEListingType } from '@/prisma/main.js';
import { buildGEListingRemapPlan, remapBankObject, remapFavouriteItems, remapGearSetup } from '@/lib/user/fixbank.js';

describe('fixbank', () => {
	test('remapBankObject remaps and merges quantities', () => {
		const result = remapBankObject({
			4041: 2,
			10446: 3,
			4042: 1,
			25487: 4,
			28310: 6,
			25484: 2,
			28338: 1,
			995: 500
		});

		expect(result.changed).toBe(true);
		expect(result.bank[4041]).toBeUndefined();
		expect(result.bank[4042]).toBeUndefined();
		expect(result.bank[10446]).toBe(5);
		expect(result.bank[10450]).toBe(1);
		expect(result.bank[25487]).toBeUndefined();
		expect(result.bank[28310]).toBe(10);
		expect(result.bank[25484]).toBeUndefined();
		expect(result.bank[28338]).toBe(3);
		expect(result.bank[995]).toBe(500);
		expect(result.moves).toEqual({ 4041: 2, 4042: 1, 25487: 4, 25484: 2 });
	});

	test('remapBankObject returns unchanged when no broken IDs exist', () => {
		const input = { 995: 1000, 10446: 1 };
		const result = remapBankObject(input);
		expect(result.changed).toBe(false);
		expect(result.bank).toEqual(input);
		expect(result.moves).toEqual({});
	});

	test('remapFavouriteItems remaps and deduplicates favourites', () => {
		const result = remapFavouriteItems([4041, 10446, 4042, 10450, 25487, 28310, 995]);
		expect(result.changed).toBe(true);
		expect(result.favourites).toEqual([10446, 10450, 28310, 995]);
	});

	test('remapGearSetup remaps broken item IDs in gear', () => {
		const result = remapGearSetup({
			cape: { item: 4041 },
			body: { item: 1127 },
			legs: null
		});

		expect(result.changed).toBe(true);
		expect(result.setup?.cape?.item).toBe(10446);
		expect(result.setup?.body?.item).toBe(1127);
		expect(result.setup?.legs).toBeNull();
	});

	test('remapBankObject is idempotent', () => {
		const once = remapBankObject({ 4041: 1, 25488: 2, 28316: 3 });
		const twice = remapBankObject(once.bank);
		expect(once.changed).toBe(true);
		expect(twice.changed).toBe(false);
		expect(twice.bank).toEqual(once.bank);
	});

	test('buildGEListingRemapPlan groups listing IDs and only moves sell quantities', () => {
		const result = buildGEListingRemapPlan([
			{ id: 1, item_id: 4041, quantity_remaining: 2, type: GEListingType.Sell },
			{ id: 2, item_id: 4041, quantity_remaining: 3, type: GEListingType.Buy },
			{ id: 3, item_id: 25487, quantity_remaining: 5, type: GEListingType.Sell },
			{ id: 4, item_id: 28310, quantity_remaining: 9, type: GEListingType.Sell }
		]);

		expect(result.listingIDsByOldID).toEqual({
			4041: [1, 2],
			25487: [3]
		});
		expect(result.sellQtyByOldID).toEqual({
			4041: 2,
			25487: 5
		});
		expect(result.totalListingsToUpdate).toBe(3);
	});

	test('buildGEListingRemapPlan handles multiple old IDs and zero sell quantity', () => {
		const result = buildGEListingRemapPlan([
			{ id: 11, item_id: 25485, quantity_remaining: 0, type: GEListingType.Sell },
			{ id: 12, item_id: 25486, quantity_remaining: 7, type: GEListingType.Buy },
			{ id: 13, item_id: 25486, quantity_remaining: 4, type: GEListingType.Sell },
			{ id: 14, item_id: 999, quantity_remaining: 99, type: GEListingType.Sell }
		]);

		expect(result.listingIDsByOldID).toEqual({
			25485: [11],
			25486: [12, 13]
		});
		expect(result.sellQtyByOldID).toEqual({
			25485: 0,
			25486: 4
		});
		expect(result.totalListingsToUpdate).toBe(3);
	});
});
