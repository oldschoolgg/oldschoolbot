import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { mockMUser } from './userutil';

describe('hasItemsEquippedOrInBank', () => {
	test("Doesn't have", () => {
		const u = mockMUser({
			bank: new Bank(),
			meleeGear: {}
		});
		expect(u.hasEquippedOrInBank('Black mask')).toEqual(false);
	});
	test('Has just in gear', () => {
		const u = mockMUser({
			bank: new Bank(),
			meleeGear: {
				head: 'Slayer helmet'
			}
		});
		expect(u.hasEquippedOrInBank('Black mask')).toEqual(true);
	});
	test('Has just in bank', () => {
		const u = mockMUser({
			bank: new Bank(),
			meleeGear: {
				head: 'Slayer helmet (i)'
			}
		});
		expect(u.hasEquippedOrInBank('Black mask')).toEqual(true);
		expect(
			mockMUser({
				bank: new Bank().add('Farming cape(t)'),
				meleeGear: {}
			}).hasEquippedOrInBank('Farming cape')
		).toEqual(true);
	});
	test('More than one item passing', () => {
		expect(
			mockMUser({
				bank: new Bank().add('Coal').add('Egg'),
				meleeGear: {
					weapon: 'Bronze dagger'
				}
			}).hasEquippedOrInBank(['Coal', 'Egg', 'Bronze dagger'])
		).toEqual(true);
	});
	test('More than one item failing', () => {
		expect(
			mockMUser({
				bank: new Bank().add('Coal').add('Egg'),
				meleeGear: {
					weapon: 'Bronze dagger'
				}
			}).hasEquippedOrInBank(['Coal', 'Egg', 'Bronze dagger', 'Trout'], 'every')
		).toEqual(false);
	});
});
