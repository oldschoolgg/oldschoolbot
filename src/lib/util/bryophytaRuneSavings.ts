import { Bank, itemID } from 'oldschooljs';

import { roll } from './rng';

const bryophytasStaffId = itemID("Bryophyta's staff");

export function calculateBryophytaRuneSavings({ user, quantity }: { user: MUser; quantity: number }): {
	savedRunes: number;
	savedBank: Bank | null;
} {
	if (quantity <= 0 || !user.hasEquipped(bryophytasStaffId)) {
		return { savedRunes: 0, savedBank: null };
	}

	let savedRunes = 0;
	for (let i = 0; i < quantity; i++) {
		if (roll(15)) savedRunes++;
	}

	if (savedRunes === 0) {
		return { savedRunes: 0, savedBank: null };
	}

	return {
		savedRunes,
		savedBank: new Bank({
			'Nature rune': savedRunes
		})
	};
}
