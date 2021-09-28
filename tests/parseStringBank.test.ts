/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bank } from 'oldschooljs';

import getOSItem from '../src/lib/util/getOSItem';
import {
	parseBankWithPrice,
	parseQuantityAndItem,
	parseStringBank,
	parseUserBankWithString
} from '../src/lib/util/parseStringBank';

const psb = parseStringBank;
const get = getOSItem;
const pQI = parseQuantityAndItem;
describe('Bank Parsers', () => {
	test('parseStringBank', async () => {
		const output = psb(' 1 twisted bow, coal,  5k egg,  1b trout ');
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
		expect(psb('twisted bow, twisted bow, 1000 twisted bow, 5k twisted bow')).toEqual([[get('Twisted bow'), 0]]);

		expect(psb('-1 twisted bow')).toEqual([[get('Twisted bow'), 0]]);

		expect(psb('1k twisted bow, twisted bow, 1000 twisted bow, 5k twisted bow')).toEqual([
			[get('Twisted bow'), 1000]
		]);
		expect(psb('5 tarromin')).toEqual([[get('Tarromin'), 5]]);
		expect(psb('3rd age platebody, 5 3rd age platelegs')).toEqual([
			[get('3rd age platebody'), 0],
			[get('3rd age platelegs'), 5]
		]);
		expect(psb('Bronze arrow, Iron arrow, Steel arrow, Rune arrow').filter(i => i[0].tradeable_on_ge)).toEqual([
			[get('Bronze arrow'), 0],
			[get('Iron arrow'), 0],
			[get('Steel arrow'), 0],
			[get('Rune arrow'), 0]
		]);
		expect(
			psb('Steel platelegs, Adamant platelegs,Non-existent item!!, Black platelegs').filter(
				i => i[0].tradeable_on_ge
			)
		).toEqual([
			[get('Steel platelegs'), 0],
			[get('Adamant platelegs'), 0],
			[get('Black platelegs'), 0]
		]);
	});

	test('parseBank - flags', async () => {
		const bank = new Bank().add('Steel arrow').add('Bones').add('Coal').add('Clue scroll (easy)');
		const res = parseUserBankWithString({
			inputBank: bank,
			flags: { equippables: '' }
		});
		expect(res.length).toEqual(1);

		const res2 = parseUserBankWithString({
			inputBank: bank,
			flags: { tradeables: '' }
		});
		expect(res2.length).toEqual(3);

		const res3 = parseUserBankWithString({
			inputBank: bank,
			flags: { untradeables: '' }
		});
		expect(res3.length).toEqual(1);
	});

	test('parseBank - filters', async () => {
		const bank = new Bank().add('Steel arrow').add('Bones').add('Coal').add('Clue scroll (easy)');
		const res = parseUserBankWithString({
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
		const res = parseUserBankWithString({
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
		const res = parseUserBankWithString({
			inputBank: bank,
			flags: {},
			inputStr: 'coal'
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Coal')).toEqual(6);

		const res2 = parseUserBankWithString({
			inputBank: bank,
			flags: {},
			inputStr: 'coal, bones'
		});
		expect(res2.length).toEqual(2);
		expect(res2.amount('Coal')).toEqual(6);
		expect(res2.amount('Bones')).toEqual(2);
	});

	test('parseBank - other', async () => {
		const bank = new Bank()
			.add('Steel arrow')
			.add('Bones', 2)
			.add('Coal', 6)
			.add('Clue scroll (easy)')
			.add('Rune arrow')
			.add('Mind rune', 50)
			.add('Rune platebody');
		const res = parseUserBankWithString({
			inputBank: bank,
			flags: {},
			inputStr: '500 coal'
		});
		expect(res.length).toEqual(1);
		expect(res.amount('Coal')).toEqual(6);
	});

	test('parseBank - same item names', async () => {
		const bank = new Bank().add(22_002);
		const res = parseUserBankWithString({
			inputBank: bank,
			flags: {},
			inputStr: 'dragonfire ward'
		});
		expect(res.length).toEqual(1);
		expect(res.amount(22_002)).toEqual(1);
	});

	test('parseBank - extra number', async () => {
		const bank = new Bank().add('Coal', 5).add('3rd age platebody', 100).add('Egg', 3);
		const res = parseUserBankWithString({
			inputBank: bank,
			flags: {},
			inputStr: `1 5 coal, 3 100 3rd age platebody,${get('Egg').id}`
		});
		expect(res.length).toEqual(3);
		expect(res.amount('Coal')).toEqual(1);
		expect(res.amount('3rd age platebody')).toEqual(3);
		expect(res.amount('Egg')).toEqual(3);

		const other = parseUserBankWithString({ inputBank: bank, inputStr: get('Egg').id.toString() });
		expect(other.amount('Egg')).toEqual(3);
	});

	test('parseBank - look for nonexistent items', async () => {
		const bank = new Bank().add('Steel arrow').add('Bones').add('Coal', 500).add('Clue scroll (easy)');
		expect(parseUserBankWithString({ inputBank: bank, inputStr: '1 Portrait' }).toString()).toEqual('No items');
		expect(parseUserBankWithString({ inputBank: bank, inputStr: '1 666' }).toString()).toEqual('No items');
		expect(parseUserBankWithString({ inputBank: bank, inputStr: '526' }).toString()).toEqual('1x Bones');
		expect(parseUserBankWithString({ inputBank: bank, inputStr: '0 cOaL' }).toString()).toEqual('500x Coal');
	});

	test('parseBank - check item aliases', async () => {
		const bank = new Bank().add('Arceuus graceful top', 30).add('Bones');
		expect(parseUserBankWithString({ inputBank: bank, inputStr: 'pUrPle gRaceful top' }).toString()).toEqual(
			'30x Arceuus graceful top'
		);
	});

	test('parseQuantityAndItem', () => {
		expect(pQI('')).toEqual([]);
		expect(pQI(' ,,, ')).toEqual([]);
		expect(pQI('1.5k twisted bow')).toEqual([[get('Twisted bow')], 1500]);
		expect(pQI('1m twisted bow')).toEqual([[get('Twisted bow')], 1_000_000]);
		expect(pQI('20 twisted bow')).toEqual([[get('Twisted bow')], 20]);
		expect(pQI('0 twisted bow')).toEqual([[get('Twisted bow')], 0]);
		expect(pQI('twisted bow')).toEqual([[get('Twisted bow')], 0]);
		expect(pQI('1 1 twisted bow')).toEqual([[get('Twisted bow')], 1]);
		const runePlate = get('Rune platebody')!;
		expect(pQI(`1 100 ${runePlate.id}`)).toEqual([[runePlate], 1]);
		expect(pQI(`${runePlate.id}`)).toEqual([[runePlate], 0]);
		expect(pQI('1 1 Dragonfire ward')).toEqual([[get(22_002)], 1]);

		// Expressions
		expect(pQI('10+10 twisted bow')).toEqual([[get('Twisted bow')], 20]);
		expect(pQI('1.5k*1 twisted bow')).toEqual([[get('Twisted bow')], 1500]);
		expect(pQI('10*10 twisted bow')).toEqual([[get('Twisted bow')], 100]);
		expect(pQI('10*10 twisted bow')).toEqual([[get('Twisted bow')], 100]);
		expect(pQI('10*10 twisted bow')).toEqual([[get('Twisted bow')], 100]);
		expect(pQI('#-1 twisted bow', new Bank().add('Twisted bow', 100))).toEqual([[get('Twisted bow')], 99]);
		expect(pQI('#/2 twisted bow', new Bank().add('Twisted bow', 100))).toEqual([[get('Twisted bow')], 50]);
		expect(pQI('#-1 twisted bow', new Bank().add('Twisted bow', 100))).toEqual([[get('Twisted bow')], 99]);
		expect(pQI('#-1 3rd age platebody', new Bank().add('3rd age platebody', 100))).toEqual([
			[get('3rd age platebody')],
			99
		]);
		expect(pQI('(#/2)+5 3rd age platebody', new Bank().add('3rd age platebody', 100))).toEqual([
			[get('3rd age platebody')],
			55
		]);

		const testBank = new Bank().add('Feather', 100_000_000_000);
		expect(pQI('1b*2 twisted bow', testBank)).toEqual([[get('Twisted bow')], 2_000_000_000]);
		expect(pQI('1m*10 twisted bow', testBank)).toEqual([[get('Twisted bow')], 10_000_000]);
		expect(pQI('1k*10 twisted bow', testBank)).toEqual([[get('Twisted bow')], 10_000]);
		expect(pQI('0.5b*2 twisted bow', testBank)).toEqual([[get('Twisted bow')], 1_000_000_000]);
		expect(pQI('1.5m*10 twisted bow', testBank)).toEqual([[get('Twisted bow')], 10_000_000 * 1.5]);
		expect(pQI('1.5k*10 twisted bow', testBank)).toEqual([[get('Twisted bow')], 10_000 * 1.5]);
	});

	test('parseBankWithPrice', async () => {
		const baseBank = new Bank().add('Toolkit').add('Cannonball');
		const pbwp = parseBankWithPrice;
		expect(pbwp({ inputBank: baseBank.clone().add('Egg', 100), str: '10k 1 egg' })).toStrictEqual({
			bank: new Bank().add('Egg'),
			price: 10_000
		});
		expect(pbwp({ inputBank: baseBank.clone().add('Egg', 100), str: '10m*5 1+5 egg' })).toStrictEqual({
			bank: new Bank().add('Egg', 6),
			price: 50_000_000
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('Egg', 100).add('Twisted bow', 10).add('Feather').add('Blood rune', 10),
				str: '10m*5 1+5 egg, #/2 twisted bow, 1+1 feather, 0 bones, # blood rune'
			})
		).toStrictEqual({
			bank: new Bank().add('Egg', 6).add('Twisted bow', 5).add('Feather').add('Blood rune', 10),
			price: 50_000_000
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('Egg', 5),
				str: '1 1 egg'
			})
		).toStrictEqual({
			bank: new Bank().add('Egg'),
			price: 1
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('Egg', 5),
				str: '2 1 egg'
			})
		).toStrictEqual({
			bank: new Bank().add('Egg'),
			price: 2
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('Egg', 5).add('Feather', 100),
				str: '1 2 egg, feather'
			})
		).toStrictEqual({
			bank: new Bank().add('Egg', 2).add('Feather', 100),
			price: 1
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('3rd age platebody', 5),
				str: '1 1 3rd age platebody'
			})
		).toStrictEqual({
			bank: new Bank().add('3rd age platebody', 1),
			price: 1
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('3rd age platebody', 5),
				str: '3 #-1 3rd age platebody'
			})
		).toStrictEqual({
			bank: new Bank().add('3rd age platebody', 4),
			price: 3
		});
		expect(
			pbwp({
				inputBank: baseBank.clone().add('Cannonball').add('Strength cape'),
				str: '.',
				flags: {
					untradeables: 'untradeables'
				}
			})
		).toStrictEqual({
			bank: new Bank().add('Strength cape'),
			price: 0
		});
	});
});
