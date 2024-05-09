import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { GeneralBank } from '../../src/lib/structures/GeneralBank';

describe('GeneralBank Fuzz Tests', () => {
	it('maintains valid value ranges on add', () => {
		fc.assert(
			fc.property(
				fc
					.integer({ min: 1, max: 1000 })
					.chain(min =>
						fc
							.integer({ min, max: 1000 })
							.chain(max =>
								fc
									.dictionary(fc.string(), fc.integer({ min, max }))
									.map(initialBank => ({ initialBank, min, max }))
							)
					),
				fc.boolean(),
				({ initialBank, min, max }, floats) => {
					const valueSchema = { min, max, floats };
					const bank = new GeneralBank<string>({
						initialBank,
						valueSchema: valueSchema as any
					});
					for (const [key, value] of Object.entries(initialBank)) {
						expect(value).toBeGreaterThanOrEqual(min);
						expect(value).toBeLessThanOrEqual(max);
						if (!floats) {
							expect(Number.isInteger(value)).toBe(true);
						}
					}
				}
			)
		);
	});

	it('validates all entries on cloning', () => {
		fc.assert(
			fc.property(fc.dictionary(fc.string(), fc.integer({ min: 1 })), initialBank => {
				const bank = new GeneralBank<string>({ initialBank });
				const clonedBank = bank.clone();
				expect(clonedBank.entries()).toEqual(bank.entries());
			})
		);
	});
});
