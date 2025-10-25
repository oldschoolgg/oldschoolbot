import { EItem } from 'oldschooljs';
import { expect, test } from 'vitest';

import { createTestUser } from '../util.js';

test('Gear - Pet', async () => {
	const user = await createTestUser();
	await user.update({
		minion_equippedPet: EItem.HERBI
	});
	await user.runCommand('gear', { pet: { unequip: true } });
	expect(user.user.minion_equippedPet).toBeNull();
	expect(user.bank.amount(EItem.HERBI)).toBe(1);
});
