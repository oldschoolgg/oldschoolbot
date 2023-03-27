import { Time } from 'e';
import { describe, expect, test } from 'vitest';

import { PercentCounter } from '../../src/lib/structures/PercentCounter';

describe('itemArg', () => {
	test('not applying', async () => {
		const counter = new PercentCounter(100, 'percent');
		expect(counter.value).toEqual(100);
		counter.add(false, -50, '');
		counter.add(false, 50, '');
		expect(counter.value).toEqual(100);
	});
	test('not applying', async () => {
		const counter = new PercentCounter(100, 'time');
		expect(counter.value).toEqual(100);
		counter.add(false, -50, '');
		counter.add(false, 50, '');
		expect(counter.value).toEqual(100);
	});
	test('remove percent', async () => {
		const counter = new PercentCounter(100, 'percent');
		expect(counter.value).toEqual(100);
		counter.add(true, -50, '');
		expect(counter.value).toEqual(50);
	});
	test('add percent', async () => {
		const counter = new PercentCounter(100, 'percent');
		expect(counter.value).toEqual(100);
		counter.add(true, 50, '');
		expect(counter.value).toEqual(100);
	});
	test('add time', async () => {
		const counter = new PercentCounter(Time.Hour, 'time');
		expect(counter.value).toEqual(Time.Hour);
		counter.add(true, 50, '');
		expect(counter.value).toEqual(Time.Hour * 1.5);
	});
	test('remove time', async () => {
		const counter = new PercentCounter(Time.Hour, 'time');
		expect(counter.value).toEqual(Time.Hour);
		counter.add(true, -50, '');
		expect(counter.value).toEqual(Time.Hour / 2);
	});
	test('other pecent', async () => {
		const counter = new PercentCounter(100, 'percent');
		expect(counter.value).toEqual(100);
		counter.add(true, -50, '');
		expect(counter.value).toEqual(50);
		counter.add(true, -50, '');
		expect(counter.value).toEqual(25);
		counter.add(true, -50, '');
		expect(counter.value.toFixed(2)).toEqual('12.50');
	});
});
