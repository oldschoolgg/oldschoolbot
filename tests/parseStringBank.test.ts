import { Bank } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import getOSItem from '../src/lib/util/getOSItem';
import { parseRichStringBank, parseStringBank } from '../src/lib/util/parseStringBank';

const psb = parseStringBank;
const get = getOSItem;

describe('Bank Parsers', () => {
	test('parseStringBank', async () => {
		const quantities = [
			['5k', 5000],
			['1.5k', 1500],
			['1m', 1_000_000],
			['20', 20],
			['0', 0],
			['', 0]
		];

		for (const [input, output] of quantities) {
			expect(psb(`${input} twisted bow`)).toEqual([
				{ qty: output, item: get('Twisted bow') }
			]);
		}

		const output = psb(` 1 twisted bow, coal,  5k egg,  1b trout `);
		const expected = [
			[get('Twisted bow'), 1],
			[get('Coal'), 0],
			[get('Egg'), 5000],
			[get('Trout'), 1_000_000_000]
		];
		expect(expected).toEqual(expect.arrayContaining(output));
		expect(output.length).toEqual(expected.length);
		for (let i = 0; i < output.length; i++) {
			let [resItem, resQty] = output[i];
			let [expItem, expQty] = expected[i];
			expect(resItem).toEqual(expItem);
			expect(resQty).toEqual(expQty);
		}

		expect(psb('')).toEqual([]);
		expect(psb(' ')).toEqual([]);
		expect(psb(', ')).toEqual([]);
		expect(psb(',, , , , ,, , , , ,')).toEqual([]);
		expect(psb('twisted bow, twisted bow, 1000 twisted bow, 5k twisted bow')).toEqual([
			{ qty: 0, item: get('Twisted bow') }
		]);

		expect(psb('1k twisted bow, twisted bow, 1000 twisted bow, 5k twisted bow')).toEqual([
			{ qty: 1000, item: get('Twisted bow') }
		]);
		expect(psb('5 tarromin')).toEqual([{ qty: 5, item: get('Tarromin') }]);
		expect(psb('3rd age platebody, 5 3rd age platelegs')).toEqual([
			{ qty: 0, item: get('3rd age platebody') },
			{ qty: 5, item: get('3rd age platelegs') }
		]);
		expect(psb('Bronze arrow, Iron arrow, Steel arrow, Rune arrow')).toEqual([
			{ qty: 0, item: get('Bronze arrow') },
			{ qty: 0, item: get('Iron arrow') },
			{ qty: 0, item: get('Steel arrow') },
			{ qty: 0, item: get('Rune arrow') }
		]);
		expect(psb('Steel platelegs, Adamant platelegs, Black platelegs')).toEqual([
			{ qty: 0, item: get('Steel platelegs') },
			{ qty: 0, item: get('Adamant platelegs') },
			{ qty: 0, item: get('Black platelegs') }
		]);
	});

	test('parseRichStringBank', async () => {
		const parsed = parseRichStringBank({
			input: 'Bronze arrow, Iron arrow, Steel arrow, Rune arrow, Trout',
			userBank: new Bank().add('Bronze arrow', 1000),
			type: 'equippables'
		});
		const items = parsed.items();
		expect(items.every(i => i[0].equipment?.slot === EquipmentSlot.Ammo)).toBeTruthy();
		expect(items.find(i => i[0].name === 'Bronze arrow')?.[1] === 1000);
	});

	test('parseRichStringBank', async () => {
		const parsed = parseRichStringBank({
			input: 'Bronze arrow, Iron arrow, Steel arrow, Rune arrow, Trout, Tangleroot',
			userBank: new Bank().add('Bronze arrow', 1000),
			type: 'untradeables',
			owned: false
		});
		const items = parsed.items();
		expect(items.length).toEqual(1);
		expect(items[0][0].name).toEqual('Tangleroot');
	});

	test('parseRichStringBank', async () => {
		const parsed = parseRichStringBank({
			input: 'Bronze arrow, Iron arrow, Steel arrow, Rune arrow, Trout, Tangleroot',
			userBank: new Bank().add('Bronze arrow', 1000),
			type: 'tradeables',
			owned: false
		});
		const items = parsed.items();
		expect(items.length).toEqual(5);
		expect(items.every(i => i[0].tradeable)).toBeTruthy();
	});

	test('parseRichStringBank', async () => {
		const parsed = parseRichStringBank({
			input: 'Bronze arrow, Iron arrow, Steel arrow, Rune arrow, Trout, Tangleroot',
			userBank: new Bank().add('Bronze arrow', 1000),
			type: 'tradeables',
			owned: true
		});
		const items = parsed.items();
		expect(items.length).toEqual(1);
	});
});
