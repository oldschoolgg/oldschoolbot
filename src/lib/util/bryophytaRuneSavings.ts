import { Bank, itemID } from 'oldschooljs';

const bryophytasStaffId = itemID("Bryophyta's staff");

export function calculateBryophytaRuneSavings({
	user,
	quantity,
	rng
}: {
	user: MUser;
	quantity: number;
	rng: { roll(chance: number): boolean };
}): {
	savedRunes: number;
	savedBank: Bank | null;
} {
	if (quantity <= 0 || !user.hasEquipped(bryophytasStaffId)) {
		return { savedRunes: 0, savedBank: null };
	}

	let savedRunes = 0;
	for (let i = 0; i < quantity; i++) {
		if (rng.roll(15)) savedRunes++;
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
