import { resolveNameBank } from '../src/lib/util';
import checkActivityQuantity from '../src/lib/util/checkActivityQuantity';
import { mockKlasaUser } from './utils';

const fakeKlasaUser = mockKlasaUser();
const baitBank1 = resolveNameBank({ 'Fishing bait': 1 });
const baitBank10 = resolveNameBank({ 'Fishing bait': 10 });
const coinBank1 = resolveNameBank({ coins: 1 });
const coinBank10 = resolveNameBank({ coins: 10 });
const baitCoinBank1 = resolveNameBank({ 'Fishing bait': 1, coins: 1 });
const baitCoinBank10 = resolveNameBank({ 'Fishing bait': 10, coins: 10 });

describe('checkActivityQuantity.test', () => {
	test('passed quant no required items', () => {
		expect(checkActivityQuantity(fakeKlasaUser, 1000, 1)).toEqual(1000);
		expect(checkActivityQuantity(fakeKlasaUser, 100, 10)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, 25, 10)).toEqual(25);
	});

	test('too large passed quant no required items', () => {
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 10000, 1);
		}).toThrow(
			"nugget can't go on trips longer than 1 second, try a lower quantity. The highest amount of this you can do is 1000."
		);
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 800, 15);
		}).toThrow(
			"nugget can't go on trips longer than 1 second, try a lower quantity. The highest amount of this you can do is 66."
		);
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 10, 123);
		}).toThrow(
			"nugget can't go on trips longer than 1 second, try a lower quantity. The highest amount of this you can do is 8."
		);
	});

	test('undefined quant no required items', () => {
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 1)).toEqual(1000);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 10)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 25)).toEqual(40);
	});

	test('passed quant with required items', () => {
		expect(checkActivityQuantity(fakeKlasaUser, 1000, 1, baitBank1)).toEqual(1000);
		expect(checkActivityQuantity(fakeKlasaUser, 100, 10, baitBank1)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, 25, 10, baitBank10)).toEqual(25);
		expect(checkActivityQuantity(fakeKlasaUser, 500, 2, coinBank1)).toEqual(500);
		expect(checkActivityQuantity(fakeKlasaUser, 100, 3, coinBank10)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, 100, 3, baitCoinBank1)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, 100, 8, baitCoinBank10)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, 25, 30, baitCoinBank10)).toEqual(25);
	});

	test('too large passed quant with required items', () => {
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 1000, 1, baitBank10);
		}).toThrow("You don't have enough Fishing bait.");
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 800, 1, coinBank10);
		}).toThrow("You don't have enough Coins.");
		expect(() => {
			checkActivityQuantity(fakeKlasaUser, 200, 1, baitCoinBank10);
		}).toThrow("You don't have enough Fishing bait, Coins.");
		expect(() => {
			checkActivityQuantity(
				mockKlasaUser({ bank: resolveNameBank({ 'Fishing bait': 100 }) }),
				50,
				1,
				baitCoinBank10
			);
		}).toThrow("You don't have enough Fishing bait.");
		expect(() => {
			checkActivityQuantity(mockKlasaUser({ GP: 100 }), 50, 1, baitCoinBank10);
		}).toThrow("You don't have enough Coins.");
	});

	test('undefined quant with required items', () => {
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 1, baitBank1)).toEqual(1000);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 10, baitBank1)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 25, baitBank10)).toEqual(40);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 10, coinBank1)).toEqual(100);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 3, coinBank1)).toEqual(333);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 4, baitCoinBank1)).toEqual(250);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 18, baitCoinBank10)).toEqual(55);
		expect(checkActivityQuantity(fakeKlasaUser, undefined, 5, baitCoinBank10)).toEqual(100);
	});

	test('undefined quant with required items when they have none', () => {
		expect(() => {
			checkActivityQuantity(
				mockKlasaUser({ bank: resolveNameBank({}) }),
				undefined,
				1,
				baitBank10
			);
		}).toThrow("You don't have enough Fishing bait.");
		expect(() => {
			checkActivityQuantity(mockKlasaUser({ GP: 0 }), undefined, 1, coinBank10);
		}).toThrow("You don't have enough Coins.");
		expect(() => {
			checkActivityQuantity(
				mockKlasaUser({ bank: resolveNameBank({}), GP: 0 }),
				undefined,
				1,
				baitCoinBank10
			);
		}).toThrow("You don't have enough Fishing bait, Coins.");
		expect(() => {
			checkActivityQuantity(
				mockKlasaUser({ bank: resolveNameBank({}) }),
				undefined,
				1,
				baitCoinBank10
			);
		}).toThrow("You don't have enough Fishing bait.");
		expect(() => {
			checkActivityQuantity(mockKlasaUser({ GP: 0 }), undefined, 1, baitCoinBank10);
		}).toThrow("You don't have enough Coins.");
	});
});
