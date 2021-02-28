import { Bank } from 'oldschooljs';

import getOSItem from '../src/lib/util/getOSItem';
import {
	FilterType,
	parseBank,
	parseFilterAndTarget,
	parseStringBank,
	satisfiesQuantitativeFilter
} from '../src/lib/util/parseStringBank';

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

	test('parseBank - flags', async () => {
		const bank = new Bank()
			.add('Steel arrow')
			.add('Bones')
			.add('Coal')
			.add('Clue scroll (easy)');
		const res = await parseBank({
			inputBank: bank,
			flags: { equippables: '' }
		});
		expect(res.length).toEqual(1);

		const res2 = await parseBank({
			inputBank: bank,
			flags: { tradeables: '' }
		});
		expect(res2.length).toEqual(3);

		const res3 = await parseBank({
			inputBank: bank,
			flags: { untradeables: '' }
		});
		expect(res3.length).toEqual(1);
	});

	test('parseBank - filters', async () => {
		const bank = new Bank()
			.add('Steel arrow')
			.add('Bones')
			.add('Coal')
			.add('Clue scroll (easy)');
		const res = await parseBank({
			inputBank: bank,
			flags: { tt: '' }
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Clue scroll (easy)')).toEqual(1);
	});

	test('parseBank - search', async () => {
		const bank = new Bank()
			.add('Steel arrow')
			.add('Bones')
			.add('Coal')
			.add('Clue scroll (easy)')
			.add('Rune arrow')
			.add('Mind rune', 50)
			.add('Rune platebody');
		const res = await parseBank({
			inputBank: bank,
			flags: { search: 'rune' }
		});
		expect(res.length).toEqual(3);
		expect(res.amount('Mind rune')).toEqual(50);
		expect(res.amount('Rune platebody')).toEqual(1);
		expect(res.amount('Rune arrow')).toEqual(1);
	});

	test('parseBank - inputStr', async () => {
		const bank = new Bank()
			.add('Steel arrow')
			.add('Bones', 2)
			.add('Coal', 6)
			.add('Clue scroll (easy)')
			.add('Rune arrow')
			.add('Mind rune', 50)
			.add('Rune platebody');
		const res = await parseBank({
			inputBank: bank,
			flags: {},
			inputStr: 'coal'
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Coal')).toEqual(6);

		const res2 = await parseBank({
			inputBank: bank,
			flags: {},
			inputStr: 'coal, bones'
		});
		expect(res2.length).toEqual(2);
		expect(res2.amount('Coal')).toEqual(6);
		expect(res2.amount('Bones')).toEqual(2);
	});

	test('parseBank - quantity filter', async () => {
		const bank = new Bank()
			.add('Steel arrow', 37)
			.add('Bones', 100_000)
			.add('Coal')
			.add('Mind rune', 50)
			.add('Rune platebody');
		let res = await parseBank({
			inputBank: bank,
			flags: { quantity: '50' }
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Mind rune')).toEqual(50);

		res = await parseBank({
			inputBank: bank,
			flags: { quantity: '>40' }
		});
		expect(res.length).toEqual(2);
		expect(res.amount('Bones')).toEqual(100_000);
		expect(res.amount('Mind rune')).toEqual(50);

		res = await parseBank({
			inputBank: bank,
			flags: { quantity: '<40' }
		});
		expect(res.length).toEqual(3);
		expect(res.amount('Steel arrow')).toEqual(37);
		expect(res.amount('Coal')).toEqual(1);
		expect(res.amount('Rune platebody')).toEqual(1);

		res = await parseBank({
			inputBank: bank,
			flags: { quantity: '100k' }
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Bones')).toEqual(100_000);
	});

	test('parseBank - parseFilterAndTarget', async () => {
		expect(parseFilterAndTarget(null)).toEqual([null, null]);
		expect(parseFilterAndTarget('')).toEqual([null, null]);
		expect(parseFilterAndTarget('abc')).toEqual([null, null]);
		expect(parseFilterAndTarget('>abc')).toEqual([null, null]);
		expect(parseFilterAndTarget('<abc')).toEqual([null, null]);
		expect(parseFilterAndTarget('k')).toEqual([null, null]);
		expect(parseFilterAndTarget('50')).toEqual([FilterType.equals, 50]);
		expect(parseFilterAndTarget('<10')).toEqual([FilterType.lessThan, 10]);
		expect(parseFilterAndTarget('>60')).toEqual([FilterType.greaterThan, 60]);
		expect(parseFilterAndTarget('500k')).toEqual([FilterType.equals, 500_000]);
		expect(parseFilterAndTarget('10.5k')).toEqual([FilterType.equals, 10_500]);
		expect(parseFilterAndTarget('>1m')).toEqual([FilterType.greaterThan, 1_000_000]);
		expect(parseFilterAndTarget('>5.9m')).toEqual([FilterType.greaterThan, 5_900_000]);
		expect(parseFilterAndTarget('<2b')).toEqual([FilterType.lessThan, 2_000_000_000]);
		expect(parseFilterAndTarget('<1.77b')).toEqual([FilterType.lessThan, 1_770_000_000]);
	});

	test('parseBank - satisfiesQuantitativeFilter', async () => {
		expect(satisfiesQuantitativeFilter(1, FilterType.equals, 1)).toEqual(true);
		expect(satisfiesQuantitativeFilter(1, FilterType.equals, 0)).toEqual(false);
		expect(satisfiesQuantitativeFilter(500, FilterType.greaterThan, 0)).toEqual(true);
		expect(satisfiesQuantitativeFilter(5, FilterType.greaterThan, 900)).toEqual(false);
		expect(satisfiesQuantitativeFilter(900, FilterType.greaterThan, 900)).toEqual(false);
		expect(satisfiesQuantitativeFilter(0, FilterType.lessThan, 500)).toEqual(true);
		expect(satisfiesQuantitativeFilter(500, FilterType.lessThan, 0)).toEqual(false);
		expect(satisfiesQuantitativeFilter(500, FilterType.lessThan, 500)).toEqual(false);
	});
});
