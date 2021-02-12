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
			expect(psb(`${input} twisted bow`)).toEqual([[get('Twisted bow'), output]]);
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
			[get('Twisted bow'), 0]
		]);

		expect(psb('1k twisted bow, twisted bow, 1000 twisted bow, 5k twisted bow')).toEqual([
			[get('Twisted bow'), 1000]
		]);
		expect(psb('5 tarromin')).toEqual([[get('Tarromin'), 5]]);
		expect(psb('3rd age platebody, 5 3rd age platelegs')).toEqual([
			[get('3rd age platebody'), 0],
			[get('3rd age platelegs'), 5]
		]);
		expect(psb('Bronze arrow, Iron arrow, Steel arrow, Rune arrow')).toEqual([
			[get('Bronze arrow'), 0],
			[get('Iron arrow'), 0],
			[get('Steel arrow'), 0],
			[get('Rune arrow'), 0]
		]);
		expect(psb('Steel platelegs, Adamant platelegs, Black platelegs')).toEqual([
			[get('Steel platelegs'), 0],
			[get('Adamant platelegs'), 0],
			[get('Black platelegs'), 0]
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
