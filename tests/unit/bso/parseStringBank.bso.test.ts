import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { parseBank } from '@/lib/util/parseStringBank.js';

describe('Bank Parsers', () => {
	test('edge cases', () => {
		const usersBank = new Bank().add('Coal', 100).add('Huge lamp', 3);
		expect(parseBank({ inputBank: usersBank, inputStr: '# coal' }).toString()).toEqual('100x Coal');
		expect(parseBank({ inputBank: usersBank, inputStr: '0 coal' }).toString()).toEqual('100x Coal');
		expect(parseBank({ inputBank: usersBank, inputStr: 'coal' }).toString()).toEqual('100x Coal');
	});

	test('ensureOldNamesDontWorkForCustomItems', () => {
		const usersBank = new Bank()
			.add('Doug', 3)
			.add('Lil lamb', 10)
			.add('Tradeable mystery box', 6)
			.add('Huge lamp', 33)
			.add('Average lamp');

		expect(
			parseBank({
				inputBank: usersBank,
				inputStr: 'snakeweed mixture, 1 indigo pentagon, indigo square, tmb'
			}).toString()
		).toEqual('6x Tradeable Mystery Box');

		expect(
			parseBank({
				inputBank: usersBank,
				inputStr: 'snakeweed mixture, 1 indigo pentagon, indigo square, mystery box'
			}).toString()
		).toEqual('No items');

		expect(
			parseBank({
				inputBank: usersBank,
				inputStr: 'snake@w-eed miXture, 0 doug, 1 lil lamb, 1 indigo pentagon, indigo square, mystery box'
			}).toString()
		).toEqual('3x Doug, 1x Lil Lamb');

		// Test when part of the name matches an overwritten item (ie. "lamp")
		expect(
			parseBank({
				inputBank: usersBank,
				inputStr: 'Huge lamp, Lil lamb, average lamp'
			}).toString()
		).toEqual('1x Average lamp, 33x Huge lamp, 10x Lil Lamb');
	});
});
