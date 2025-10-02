import { Time } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../src/lib/skilling/skills/fletching/fletchables/index.js';
import {
	attemptZeroTimeActivity,
	getZeroTimeFletchTime,
	type ZeroTimeActivityPreference
} from '../../src/lib/util/zeroTimeActivity.js';
import { timePerAlch } from '../../src/mahoji/lib/abstracted_commands/alchCommand.js';
import { mockMUser } from './userutil.js';

describe('attemptZeroTimeActivity', () => {
	test('alching success', () => {
		const item = Items.getOrThrow('Yew longbow');
		const duration = timePerAlch * 50;
		const user = mockMUser({
			bank: new Bank().add('Nature rune', 200).add('Fire rune', 500).add(item.id, 200),
			skills_magic: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'alch', itemID: item.id };
		const response = attemptZeroTimeActivity({
			user,
			duration,
			preferences: [preference],
			alch: { variant: 'default' }
		});

		expect(response.failures).toHaveLength(0);
		expect(response.result?.type).toBe('alch');
		if (!response.result || response.result.type !== 'alch') return;

		expect(response.result.quantity).toBe(50);
		const expectedRemove = new Bank().add('Nature rune', 50).add('Fire rune', 250).add(item.id, 50);
		expect(response.result.bankToRemove.equals(expectedRemove)).toBe(true);
		expect(response.result.bankToAdd.equals(new Bank().add('Coins', (item.highalch ?? 0) * 50))).toBe(true);
		expect(response.result.timePerAction).toBe(timePerAlch);
	});

	test('alching override respects items per hour', () => {
		const item = Items.getOrThrow('Yew longbow');
		const duration = Time.Hour;
		const ratePerHour = 1000;
		const user = mockMUser({
			bank: new Bank()
				.add('Nature rune', ratePerHour * 2)
				.add('Fire rune', ratePerHour * 10)
				.add(item.id, ratePerHour * 2),
			skills_magic: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'alch', itemID: item.id };
		const response = attemptZeroTimeActivity({
			user,
			duration,
			preferences: [preference],
			alch: { variant: 'default', itemsPerHour: ratePerHour }
		});

		expect(response.result?.type).toBe('alch');
		if (!response.result || response.result.type !== 'alch') return;

		expect(response.result.quantity).toBe(ratePerHour);
		expect(response.result.timePerAction).toBe(duration / ratePerHour);
	});

	test('alching failure when missing runes', () => {
		const item = Items.getOrThrow('Yew longbow');
		const user = mockMUser({
			bank: new Bank().add(item.id, 10),
			skills_magic: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'alch', itemID: item.id };
		const response = attemptZeroTimeActivity({
			user,
			duration: timePerAlch * 10,
			preferences: [preference],
			alch: { variant: 'default' }
		});

		expect(response.result).toBeNull();
		expect(response.failures[0]?.message).toBe("You're missing resources to alch Yew longbow.");
	});

	test('alching failure when missing only nature runes', () => {
		const item = Items.getOrThrow('Yew longbow');
		const user = mockMUser({
			bank: new Bank().add(item.id, 10).add('Fire rune', 500),
			skills_magic: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'alch', itemID: item.id };
		const response = attemptZeroTimeActivity({
			user,
			duration: timePerAlch * 10,
			preferences: [preference],
			alch: { variant: 'default' }
		});

		expect(response.result).toBeNull();
		expect(response.failures[0]?.message).toBe("You're missing resources to alch Yew longbow.");
	});

	test('alching failure when missing only fire runes', () => {
		const item = Items.getOrThrow('Yew longbow');
		const user = mockMUser({
			bank: new Bank().add(item.id, 10).add('Nature rune', 10),
			skills_magic: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'alch', itemID: item.id };
		const response = attemptZeroTimeActivity({
			user,
			duration: timePerAlch * 10,
			preferences: [preference],
			alch: { variant: 'default' }
		});

		expect(response.result).toBeNull();
		expect(response.failures[0]?.message).toBe("You're missing resources to alch Yew longbow.");
	});

	test('fletching success', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const duration = Time.Second * 40;
		const user = mockMUser({
			bank: new Bank().add('Steel dart tip', 200).add('Feather', 200),
			skills_fletching: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'fletch', itemID: fletchable.id };
		const response = attemptZeroTimeActivity({
			user,
			duration,
			preferences: [preference]
		});

		expect(response.failures).toHaveLength(0);
		expect(response.result?.type).toBe('fletch');
		if (!response.result || response.result.type !== 'fletch') return;

		expect(response.result.quantity).toBe(200);
		const expectedRemove = fletchable.inputItems.clone().multiply(200);
		expect(response.result.itemsToRemove.equals(expectedRemove)).toBe(true);
		expect(response.result.timePerAction).toBeCloseTo(Time.Second * 0.2, 5);
	});

	test('fletching override matches default throughput for multi-output items', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const originalOutputMultiple = fletchable.outputMultiple;
		fletchable.outputMultiple = 4;

		try {
			const timePerItem = getZeroTimeFletchTime(fletchable);
			expect(timePerItem).not.toBeNull();
			if (!timePerItem) return;

			const duration = Time.Hour;
			const outputMultiple = fletchable.outputMultiple ?? 1;
			const defaultSets = Math.floor(duration / timePerItem);
			const itemsPerHour = (Time.Hour / timePerItem) * outputMultiple;

			const baseUser = mockMUser({
				bank: new Bank().add('Steel dart tip', defaultSets * 2).add('Feather', defaultSets * 2),
				skills_fletching: convertLVLtoXP(70)
			});
			const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'fletch', itemID: fletchable.id };

			const baseResponse = attemptZeroTimeActivity({
				user: baseUser,
				duration,
				preferences: [preference]
			});

			expect(baseResponse.failures).toHaveLength(0);
			expect(baseResponse.result?.type).toBe('fletch');
			if (!baseResponse.result || baseResponse.result.type !== 'fletch') return;

			expect(baseResponse.result.quantity).toBe(defaultSets);
			expect(baseResponse.result.itemsToRemove.amount('Steel dart tip')).toBe(defaultSets);
			expect(baseResponse.result.itemsToRemove.amount('Feather')).toBe(defaultSets);
			expect(baseResponse.result.timePerAction).toBeCloseTo(timePerItem, 5);

			const overrideUser = mockMUser({
				bank: new Bank().add('Steel dart tip', defaultSets * 2).add('Feather', defaultSets * 2),
				skills_fletching: convertLVLtoXP(70)
			});

			const overrideResponse = attemptZeroTimeActivity({
				user: overrideUser,
				duration,
				preferences: [preference],
				fletch: { itemsPerHour }
			});

			expect(overrideResponse.failures).toHaveLength(0);
			expect(overrideResponse.result?.type).toBe('fletch');
			if (!overrideResponse.result || overrideResponse.result.type !== 'fletch') return;

			expect(overrideResponse.result.quantity).toBe(baseResponse.result.quantity);
			expect(overrideResponse.result.quantity).toBe(defaultSets);
			expect(overrideResponse.result.itemsToRemove.amount('Steel dart tip')).toBe(defaultSets);
			expect(overrideResponse.result.itemsToRemove.amount('Feather')).toBe(defaultSets);
			expect(overrideResponse.result.timePerAction).toBeCloseTo(duration / defaultSets, 5);
		} finally {
			fletchable.outputMultiple = originalOutputMultiple;
		}
	});

	test('zero time fletchables require stackable inputs and outputs', () => {
		expect(zeroTimeFletchables.some(item => item.name === 'Wolfbone arrowtips')).toBe(false);

		for (const fletchable of zeroTimeFletchables) {
			const outputItem = Items.getOrThrow(fletchable.id);
			expect(outputItem.stackable).toBe(true);
			for (const [item] of fletchable.inputItems.items()) {
				expect(item.stackable).toBe(true);
			}
		}
	});

	test('fletching failure without slayer unlock', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Broad arrows');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = mockMUser({
			bank: new Bank().add('Broad arrowheads', 10).add('Headless arrow', 10),
			skills_fletching: convertLVLtoXP(70)
		});

		const preference: ZeroTimeActivityPreference = { role: 'primary', type: 'fletch', itemID: fletchable.id };
		const response = attemptZeroTimeActivity({
			user,
			duration: Time.Second * 10,
			preferences: [preference]
		});

		expect(response.result).toBeNull();
		expect(response.failures[0]?.message).toBe(
			"You don't have the required Slayer unlocks to fletch Broad arrows."
		);
	});
});
