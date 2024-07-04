import { Time } from 'e';
import { describe, expect, test } from 'vitest';

import { MUserClass } from '../../src/lib/MUser';
import { BitField, PerkTier } from '../../src/lib/constants';
import { getUsersPerkTier } from '../../src/lib/perkTiers';
import { mockMUser } from './utils';

describe('getUsersPerkTier', () => {
	test('general', () => {
		expect(getUsersPerkTier([])).toEqual(0);
		expect(getUsersPerkTier(mockMUser())).toEqual(0);
		expect(getUsersPerkTier(mockMUser({ bitfield: [BitField.IsPatronTier3] }))).toEqual(PerkTier.Four);
		expect(getUsersPerkTier(mockMUser({ bitfield: [BitField.isModerator] }))).toEqual(PerkTier.Four);
	});
	test('balance', () => {
		const user = mockMUser({ premium_balance_expiry_date: Date.now() + Time.Day, premium_balance_tier: 3 });
		expect(user instanceof MUserClass).toEqual(true);
		expect(user.user.premium_balance_tier !== null).toEqual(true);
		expect(user.perkTier()).toEqual(PerkTier.Four);
	});
});
