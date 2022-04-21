import { Bank } from 'oldschooljs';

import { hasItemEquippedOrInBank } from '../src/lib/util/minionUtils';
import { mockUser } from './utils';

describe('hasItemEquippedOrInBank', () => {
	test("Doesn't have", () => {
		expect(
			hasItemEquippedOrInBank(
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
			hasItemEquippedOrInBank(
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
			hasItemEquippedOrInBank(
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
			hasItemEquippedOrInBank(
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
			hasItemEquippedOrInBank(
				mockUser({
					bank: new Bank().add('Coal').add('Egg'),
					meleeGear: {
						weapon: 'Bronze dagger'
					}
				}),
				['Coal', 'Egg', 'Bronze dagger', 'Trout']
			)
		).toEqual(false);
	});
});
