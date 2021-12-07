import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import getUserFoodFromBank from '../src/lib/minions/functions/getUserFoodFromBank';
import { stripEmojis, carpenterBoostPercent } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import { constructGearSetup, GearSetup } from '../src/lib/gear';

const fakeUser = (b: Bank, gear?: GearSetup) =>
({
	bank: () => b,
	skillLevel: () => 99,
	getGear: () => gear
} as any as KlasaUser);

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('getOSItem', () => {
		expect(getOSItem('Twisted bow').id).toEqual(20_997);
		expect(getOSItem(20_997).id).toEqual(20_997);
		expect(getOSItem('20997').id).toEqual(20_997);
		expect(getOSItem('3rd age platebody').id).toEqual(10_348);

		expect(() => getOSItem('Non-existant item')).toThrowError("Non-existant item doesn't exist.");
	});

	test('getUserFoodFromBank', () => {
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark')), 500, [])).toStrictEqual(false);
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark', 100)), 500, [])).toStrictEqual(
			new Bank().add('Shark', 25)
		);
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark', 30).add('Tuna', 20)), 750, [])).toStrictEqual(
			new Bank().add('Shark', 28).add('Tuna', 20)
		);
		expect(
			getUserFoodFromBank(
				fakeUser(new Bank().add('Shark', 100).add('Lobster', 20).add('Shrimps', 50).add('Coal')),
				1600,
				[]
			)
		).toStrictEqual(new Bank().add('Lobster', 20).add('Shark', 66).add('Shrimps', 50));
	});

	test('carpenterBoostPercent', () => {
		expect(
			carpenterBoostPercent(
				fakeUser(new Bank(), 
				constructGearSetup({
					head: "Carpenter's helmet",
					body: "Carpenter's shirt",
					legs: "Carpenter's trousers",
					feet: "Carpenter's boots"
				}))
			)
		).toEqual(2.5);
		expect(
			carpenterBoostPercent(
				fakeUser(new Bank(), 
				constructGearSetup({
					head: "Carpenter's helmet",
					body: "Carpenter's shirt",
					legs: "Carpenter's trousers"
				}))
			)
		).toEqual(1.8);
		expect(
			carpenterBoostPercent(
				fakeUser(new Bank(), 
				constructGearSetup({
					feet: "Carpenter's boots"
				}))
			)
		).toEqual(0.2);
		expect(
			carpenterBoostPercent(
				fakeUser(new Bank(), 
				constructGearSetup({
					feet: "Dragon boots"
				}))
			)
		).toEqual(0);
	});
});
