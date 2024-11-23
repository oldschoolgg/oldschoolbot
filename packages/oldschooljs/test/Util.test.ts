import { describe, expect, test } from 'vitest';

import { Util } from '../src';

describe('Utils', () => {
	test('toKMB checks', async () => {
		expect.assertions(10);

		expect(Util.toKMB(5)).toEqual('5');

		expect(Util.toKMB(1000)).toEqual('1k');
		expect(Util.toKMB(1500)).toEqual('1.5k');

		expect(Util.toKMB(1_000_000)).toEqual('1m');
		expect(Util.toKMB(1_500_000)).toEqual('1.5m');
		expect(Util.toKMB(15_000_000)).toEqual('15m');
		expect(Util.toKMB(150_000_000)).toEqual('150m');

		expect(Util.toKMB(1_000_000_000)).toEqual('1b');
		expect(Util.toKMB(1_200_000_000)).toEqual('1.2b');
		expect(Util.toKMB(50_000_000_000)).toEqual('50b');
	});

	test('negative toKMB checks', async () => {
		expect.assertions(10);

		expect(Util.toKMB(-5)).toEqual('-5');

		expect(Util.toKMB(-1000)).toEqual('-1k');
		expect(Util.toKMB(-1500)).toEqual('-1.5k');

		expect(Util.toKMB(-1_000_000)).toEqual('-1m');
		expect(Util.toKMB(-1_500_000)).toEqual('-1.5m');
		expect(Util.toKMB(-15_000_000)).toEqual('-15m');
		expect(Util.toKMB(-150_000_000)).toEqual('-150m');

		expect(Util.toKMB(-1_000_000_000)).toEqual('-1b');
		expect(Util.toKMB(-1_200_000_000)).toEqual('-1.2b');
		expect(Util.toKMB(-50_000_000_000)).toEqual('-50b');
	});

	test('KMB checks', async () => {
		expect.assertions(10);

		expect(Util.fromKMB('5')).toEqual(5);

		expect(Util.fromKMB('1k')).toEqual(1000);
		expect(Util.fromKMB('1.5k')).toEqual(1500);

		expect(Util.fromKMB('1m')).toEqual(1_000_000);
		expect(Util.fromKMB('1.5m')).toEqual(1_500_000);
		expect(Util.fromKMB('15m')).toEqual(15_000_000);
		expect(Util.fromKMB('150m')).toEqual(150_000_000);

		expect(Util.fromKMB('1b')).toEqual(1_000_000_000);
		expect(Util.fromKMB('1.2b')).toEqual(1_200_000_000);
		expect(Util.fromKMB('50b')).toEqual(50_000_000_000);
	});

	test('Brimestone chance calc', async () => {
		expect.assertions(6);

		expect(Util.getBrimKeyChanceFromCBLevel(725)).toEqual(50);
		expect(Util.getBrimKeyChanceFromCBLevel(321)).toEqual(56);
		expect(Util.getBrimKeyChanceFromCBLevel(303)).toEqual(59);
		expect(Util.getBrimKeyChanceFromCBLevel(123)).toEqual(95);
		expect(Util.getBrimKeyChanceFromCBLevel(28)).toEqual(1137);
		expect(Util.getBrimKeyChanceFromCBLevel(2)).toEqual(2021);
	});
});
