import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { BitField } from '@/lib/constants.js';
import { userOpenUntilItems } from '@/mahoji/lib/abstracted_commands/openCommand.js';
import { mockMUser } from './userutil.js';

describe('open until items', () => {
	test('includes Rite of vile transference before it has been received or used', () => {
		const user = mockMUser();

		expect(userOpenUntilItems(user).some(item => item.name === 'Rite of vile transference')).toBe(true);
	});

	test('excludes Rite of vile transference after it has been used', () => {
		const user = mockMUser({
			bitfield: [BitField.HasRiteOfVileTransference]
		});

		expect(userOpenUntilItems(user).some(item => item.name === 'Rite of vile transference')).toBe(false);
	});

	test('excludes Rite of vile transference after it has been logged', () => {
		const user = mockMUser({
			cl: new Bank().add('Rite of vile transference')
		});

		expect(userOpenUntilItems(user).some(item => item.name === 'Rite of vile transference')).toBe(false);
	});
});
