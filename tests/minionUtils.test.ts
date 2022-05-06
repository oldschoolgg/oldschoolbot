import { Bank } from 'oldschooljs';

import { hasItemsEquippedOrInBank } from '../src/lib/util/minionUtils';
import { mockUser } from './utils';

describe('hasItemsEquippedOrInBank', () => {
	test("Doesn't have", () => {
		expect(
			hasItemsEquippedOrInBank(
				mockUser({
					bank: new Bank(),
					meleeGear: {}
				}),
				['Black mask']
			)
		).toEqual(false);
	});
	test('Has just in gear', () => {
		expect(
			hasItemsEquippedOrInBank(
				mockUser({
					bank: new Bank(),
					meleeGear: {
						head: 'Slayer helmet'
					}
				}),
				['Black mask']
			)
		).toEqual(true);
	});
	test('Has just in bank', () => {
		expect(
			hasItemsEquippedOrInBank(
				mockUser({
					bank: new Bank().add('Slayer helmet (i)'),
					meleeGear: {}
				}),
				['Black mask']
			)
		).toEqual(true);
	});
	test('More than one item passing', () => {
		expect(
			hasItemsEquippedOrInBank(
				mockUser({
					bank: new Bank().add('Coal').add('Egg'),
					meleeGear: {
						weapon: 'Bronze dagger'
					}
				}),
				['Coal', 'Egg', 'Bronze dagger']
			)
		).toEqual(true);
	});
	test('More than one item failing', () => {
		expect(
			hasItemsEquippedOrInBank(
				mockUser({
					bank: new Bank().add('Coal').add('Egg'),
					meleeGear: {
						weapon: 'Bronze dagger'
					}
				}),
				['Coal', 'Egg', 'Bronze dagger', 'Trout'],
				'every'
			)
		).toEqual(false);
	});
});
