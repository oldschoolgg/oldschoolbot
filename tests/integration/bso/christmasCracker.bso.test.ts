import { partyHatTableRoll } from '@/lib/bso/holidayItems.js';

import { Bank } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

describe('BSO Christmas cracker test', async () => {
	it('PartyhatTable contains all expected partyhats', () => {
		const EXPECTED = [
			'Black partyhat',
			'Pink partyhat',
			'Rainbow partyhat',
			'Red partyhat',
			'Yellow partyhat',
			'Blue partyhat',
			'Purple partyhat',
			'Green partyhat',
			'White partyhat',
			'Silver partyhat'
		];

		const crackerBank = new Bank();
		for (let i = 0; i < 50_000; i++) {
			crackerBank.add(partyHatTableRoll());
		}
		for (const hat of EXPECTED) {
			expect(crackerBank.has(hat)).toBe(true);
		}
	});
});
