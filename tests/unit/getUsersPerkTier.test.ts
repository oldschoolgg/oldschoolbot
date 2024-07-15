import { describe, expect, test } from 'vitest';

import { BitField, PerkTier } from '../../src/lib/constants';
import { getUsersPerkTier } from '../../src/lib/perkTiers';
import { mockMUser } from './utils';

describe('getUsersPerkTier', () => {
	test('general', () => {
		expect(getUsersPerkTier(mockMUser())).toEqual(0);
		expect(getUsersPerkTier(mockMUser({ bitfield: [BitField.IsPatronTier3] }))).toEqual(PerkTier.Four);
		expect(getUsersPerkTier(mockMUser({ bitfield: [BitField.isModerator] }))).toEqual(PerkTier.Four);
	});
});
