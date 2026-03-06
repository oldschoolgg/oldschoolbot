import type { IBlowpipeData } from '@oldschoolgg/schemas';
import { EItem } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser, mockClient } from '../util.js';

describe('updateBlowpipe()', async () => {
	await mockClient();

	it('should update blowpipe with valid data - empty blowpipe', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 0,
			dartID: null,
			dartQuantity: 0
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe).toEqual(blowpipeData);
	});

	it('should update blowpipe with scales only', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 1000,
			dartID: null,
			dartQuantity: 0
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(1000);
		expect(updatedBlowpipe.dartID).toBeNull();
		expect(updatedBlowpipe.dartQuantity).toBe(0);
	});

	it('should update blowpipe with scales and dragon darts', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 5000,
			dartID: EItem.DRAGON_DART,
			dartQuantity: 500
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(5000);
		expect(updatedBlowpipe.dartID).toBe(EItem.DRAGON_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(500);
	});

	it('should update blowpipe with different dart types', async () => {
		const user = await createTestUser();

		// Start with rune darts
		await user.updateBlowpipe({
			scales: 1000,
			dartID: EItem.RUNE_DART,
			dartQuantity: 100
		});

		let updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.dartID).toBe(EItem.RUNE_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(100);

		// Update to adamant darts
		await user.updateBlowpipe({
			scales: 2000,
			dartID: EItem.ADAMANT_DART,
			dartQuantity: 200
		});

		updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(2000);
		expect(updatedBlowpipe.dartID).toBe(EItem.ADAMANT_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(200);
	});

	it('should update blowpipe multiple times', async () => {
		const user = await createTestUser();

		// First update
		await user.updateBlowpipe({
			scales: 100,
			dartID: EItem.BRONZE_DART,
			dartQuantity: 50
		});

		let updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(100);
		expect(updatedBlowpipe.dartQuantity).toBe(50);

		// Second update
		await user.updateBlowpipe({
			scales: 200,
			dartID: EItem.BRONZE_DART,
			dartQuantity: 100
		});

		updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(200);
		expect(updatedBlowpipe.dartQuantity).toBe(100);

		// Third update - empty the blowpipe
		await user.updateBlowpipe({
			scales: 0,
			dartID: null,
			dartQuantity: 0
		});

		updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(0);
		expect(updatedBlowpipe.dartID).toBeNull();
		expect(updatedBlowpipe.dartQuantity).toBe(0);
	});

	it('should update blowpipe with amethyst darts', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 16000,
			dartID: EItem.AMETHYST_DART,
			dartQuantity: 1000
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(16000);
		expect(updatedBlowpipe.dartID).toBe(EItem.AMETHYST_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(1000);
	});

	it('should handle edge case with 0 scales but valid dart type', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 0,
			dartID: EItem.STEEL_DART,
			dartQuantity: 50
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(0);
		expect(updatedBlowpipe.dartID).toBe(EItem.STEEL_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(50);
	});

	it('should throw error on invalid data - negative scales', async () => {
		const user = await createTestUser();
		const blowpipeData = {
			scales: -100,
			dartID: null,
			dartQuantity: 0
		};

		await expect(user.updateBlowpipe(blowpipeData as IBlowpipeData)).rejects.toThrow();
	});

	it('should throw error on invalid data - negative dart quantity', async () => {
		const user = await createTestUser();
		const blowpipeData = {
			scales: 100,
			dartID: EItem.RUNE_DART,
			dartQuantity: -50
		};

		await expect(user.updateBlowpipe(blowpipeData as IBlowpipeData)).rejects.toThrow();
	});

	it('should throw error on invalid data - null dartID with non-zero dartQuantity', async () => {
		const user = await createTestUser();
		const blowpipeData = {
			scales: 100,
			dartID: null,
			dartQuantity: 50
		};

		await expect(user.updateBlowpipe(blowpipeData as IBlowpipeData)).rejects.toThrow();
	});

	it('should update blowpipe with maximum realistic values', async () => {
		const user = await createTestUser();
		const blowpipeData: IBlowpipeData = {
			scales: 16383, // Max scales
			dartID: EItem.DRAGON_DART,
			dartQuantity: 16383 // Max darts
		};

		await user.updateBlowpipe(blowpipeData);

		const updatedBlowpipe = user.getBlowpipe();
		expect(updatedBlowpipe.scales).toBe(16383);
		expect(updatedBlowpipe.dartID).toBe(EItem.DRAGON_DART);
		expect(updatedBlowpipe.dartQuantity).toBe(16383);
	});

	it('should handle all valid dart types', async () => {
		const user = await createTestUser();
		const dartTypes = [
			EItem.BRONZE_DART,
			EItem.IRON_DART,
			EItem.STEEL_DART,
			EItem.BLACK_DART,
			EItem.MITHRIL_DART,
			EItem.ADAMANT_DART,
			EItem.RUNE_DART,
			EItem.AMETHYST_DART,
			EItem.DRAGON_DART
		];

		for (const dartID of dartTypes) {
			await user.updateBlowpipe({
				scales: 100,
				dartID,
				dartQuantity: 10
			});
			await user.sync();

			const updatedBlowpipe = user.getBlowpipe();
			expect(updatedBlowpipe.dartID).toBe(dartID);
			expect(updatedBlowpipe.dartQuantity).toBe(10);
		}
	});
});
