import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { FloatBank } from '../../src/lib/structures/Bank';

describe('Floatbank', () => {
	test('multiply', () => {
		const bank = new FloatBank();
		bank.add(1, 0.1);
		bank.add(2, 0.333);
		bank.multiply(2);
		expect(bank.amount(1)).toBe(0.2);
		expect(bank.amount(2)).toBe(0.666);
		expect(bank.fits(new Bank().add(1).add(2))).toEqual(1);

		const bank2 = new FloatBank();
		bank2.add(1, 1);
		bank2.add(2, 1);
		expect(bank2.fits(new Bank().add(1))).toEqual(0);
		expect(bank2.fits(new Bank().add(1).add(2))).toEqual(1);
	});
});
