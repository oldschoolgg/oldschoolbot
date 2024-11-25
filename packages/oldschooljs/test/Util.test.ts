import { describe, expect, test } from 'vitest';
import { fromKMB, getBrimKeyChanceFromCBLevel, toKMB } from '../';

describe('Utils', () => {
	test('toKMB checks', async () => {
		expect.assertions(10);

		expect(toKMB(5)).toEqual('5');

		expect(toKMB(1000)).toEqual('1k');
		expect(toKMB(1500)).toEqual('1.5k');

		expect(toKMB(1_000_000)).toEqual('1m');
		expect(toKMB(1_500_000)).toEqual('1.5m');
		expect(toKMB(15_000_000)).toEqual('15m');
		expect(toKMB(150_000_000)).toEqual('150m');

		expect(toKMB(1_000_000_000)).toEqual('1b');
		expect(toKMB(1_200_000_000)).toEqual('1.2b');
		expect(toKMB(50_000_000_000)).toEqual('50b');
	});

	test('negative toKMB checks', async () => {
		expect.assertions(10);

		expect(toKMB(-5)).toEqual('-5');

		expect(toKMB(-1000)).toEqual('-1k');
		expect(toKMB(-1500)).toEqual('-1.5k');

		expect(toKMB(-1_000_000)).toEqual('-1m');
		expect(toKMB(-1_500_000)).toEqual('-1.5m');
		expect(toKMB(-15_000_000)).toEqual('-15m');
		expect(toKMB(-150_000_000)).toEqual('-150m');

		expect(toKMB(-1_000_000_000)).toEqual('-1b');
		expect(toKMB(-1_200_000_000)).toEqual('-1.2b');
		expect(toKMB(-50_000_000_000)).toEqual('-50b');
	});

	test('KMB checks', async () => {
		expect.assertions(10);

		expect(fromKMB('5')).toEqual(5);

		expect(fromKMB('1k')).toEqual(1000);
		expect(fromKMB('1.5k')).toEqual(1500);

		expect(fromKMB('1m')).toEqual(1_000_000);
		expect(fromKMB('1.5m')).toEqual(1_500_000);
		expect(fromKMB('15m')).toEqual(15_000_000);
		expect(fromKMB('150m')).toEqual(150_000_000);

		expect(fromKMB('1b')).toEqual(1_000_000_000);
		expect(fromKMB('1.2b')).toEqual(1_200_000_000);
		expect(fromKMB('50b')).toEqual(50_000_000_000);
	});

	test('Brimestone chance calc', async () => {
		expect.assertions(6);

		expect(getBrimKeyChanceFromCBLevel(725)).toEqual(50);
		expect(getBrimKeyChanceFromCBLevel(321)).toEqual(56);
		expect(getBrimKeyChanceFromCBLevel(303)).toEqual(59);
		expect(getBrimKeyChanceFromCBLevel(123)).toEqual(95);
		expect(getBrimKeyChanceFromCBLevel(28)).toEqual(1137);
		expect(getBrimKeyChanceFromCBLevel(2)).toEqual(2021);
	});
});
