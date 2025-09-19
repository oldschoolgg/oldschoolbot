import { Time } from 'e';
import { Bank, Items, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../src/lib/skilling/skills/fletching/fletchables';
import { attemptZeroTimeActivity } from '../../src/lib/util/zeroTimeActivity';
import { timePerAlch } from '../../src/mahoji/lib/abstracted_commands/alchCommand';
import { mockMUser } from './userutil';

describe('attemptZeroTimeActivity', () => {
	test('alching success', () => {
		const item = Items.getOrThrow('Yew longbow');
		const duration = timePerAlch * 50;
		const user = mockMUser({
			bank: new Bank().add('Nature rune', 200).add('Fire rune', 500).add(item.id, 200),
			skills_magic: convertLVLtoXP(70),
			zero_time_activity_type: 'alch',
			zero_time_activity_item: item.id
		});

		const response = attemptZeroTimeActivity({
			type: 'alch',
			user,
			duration,
			variant: 'default'
		});

		expect(response.message).toBeUndefined();
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
			skills_magic: convertLVLtoXP(70),
			zero_time_activity_type: 'alch',
			zero_time_activity_item: item.id
		});

		const response = attemptZeroTimeActivity({
			type: 'alch',
			user,
			duration,
			variant: 'default',
			itemsPerHour: ratePerHour
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
			skills_magic: convertLVLtoXP(70),
			zero_time_activity_type: 'alch',
			zero_time_activity_item: item.id
		});

		const response = attemptZeroTimeActivity({
			type: 'alch',
			user,
			duration: timePerAlch * 10,
			variant: 'default'
		});

		expect(response.result).toBeNull();
		expect(response.message).toBe("You're missing resources to alch Yew longbow.");
	});

	test('fletching success', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const duration = Time.Second * 40;
		const user = mockMUser({
			bank: new Bank().add('Steel dart tip', 200).add('Feather', 200),
			skills_fletching: convertLVLtoXP(70),
			zero_time_activity_type: 'fletch',
			zero_time_activity_item: fletchable.id
		});

		const response = attemptZeroTimeActivity({
			type: 'fletch',
			user,
			duration
		});

		expect(response.message).toBeUndefined();
		expect(response.result?.type).toBe('fletch');
		if (!response.result || response.result.type !== 'fletch') return;

		expect(response.result.quantity).toBe(200);
		const expectedRemove = fletchable.inputItems.clone().multiply(200);
		expect(response.result.itemsToRemove.equals(expectedRemove)).toBe(true);
		expect(response.result.timePerAction).toBeCloseTo(Time.Second * 0.2, 5);
	});

	test('fletching override uses item rate', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Wolfbone arrowtips');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const duration = Time.Hour;
		const itemsPerHour = 12_000;
		const outputMultiple = fletchable.outputMultiple ?? 1;
		const expectedSets = Math.floor((itemsPerHour * duration) / Time.Hour / outputMultiple);
		const user = mockMUser({
			bank: new Bank().add('Wolf bones', expectedSets * 2),
			skills_fletching: convertLVLtoXP(70),
			zero_time_activity_type: 'fletch',
			zero_time_activity_item: fletchable.id
		});

		const response = attemptZeroTimeActivity({
			type: 'fletch',
			user,
			duration,
			itemsPerHour
		});

		expect(response.result?.type).toBe('fletch');
		if (!response.result || response.result.type !== 'fletch') return;

		expect(response.result.quantity).toBe(expectedSets);
		expect(response.result.itemsToRemove.amount('Wolf bones')).toBe(expectedSets);
		expect(response.result.timePerAction).toBeCloseTo(duration / expectedSets, 5);
	});

	test('fletching failure without slayer unlock', () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Broad arrows');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = mockMUser({
			bank: new Bank().add('Broad arrowheads', 10).add('Headless arrow', 10),
			skills_fletching: convertLVLtoXP(70),
			zero_time_activity_type: 'fletch',
			zero_time_activity_item: fletchable.id
		});

		const response = attemptZeroTimeActivity({
			type: 'fletch',
			user,
			duration: Time.Second * 10
		});

		expect(response.result).toBeNull();
		expect(response.message).toBe("You don't have the required Slayer unlocks to fletch Broad arrows.");
	});
});
