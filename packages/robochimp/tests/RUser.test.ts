import { PerkTier } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

import { Bits } from '@/util.js';
import { mockUser } from './util.js';

describe('RUser', async () => {
	test('isMod', async () => {
		const user = mockUser();
		expect(user.isMod()).toBe(false);
		await user.update({ bits: [Bits.Mod] });
		expect(user.isMod()).toBe(true);
		await user.update({ bits: [Bits.Admin] });
		expect(user.isMod()).toBe(true);
		await user.update({ bits: [] });
		expect(user.isMod()).toBe(false);
	});

	test('perkTier', async () => {
		const user = mockUser();
		expect(typeof user.id).toBe('bigint');
		expect(user.perkTierRaw).toBe(0);
		expect(user.perkTier).toBe(null);

		await user.update({ perk_tier: PerkTier.Four });
		expect(user.perkTierRaw).toBe(4);
		expect(user.perkTier).not.toBe(null);
		expect(user.perkTier?.perkTier).toBe(4);
		expect(user.perkTier?.bit).toBe(Bits.IsPatronTier3);
	});

	test('globalMastery', async () => {
		const user = mockUser();
		expect(user.globalMastery()).toBe(0);
		await user.update({ osb_mastery: 100 });
		expect(user.globalMastery()).toBe(50);
		await user.update({ osb_mastery: 25, bso_mastery: 25 });
		expect(user.globalMastery()).toBe(25);
	});

	test('globalCLPercent', async () => {
		const user = mockUser();
		expect(user.globalCLPercent()).toBe(0);
		await user.update({ osb_cl_percent: 100 });
		expect(user.globalCLPercent()).toBe(50);
		await user.update({ osb_cl_percent: 25, bso_cl_percent: 25 });
		expect(user.globalCLPercent()).toBe(25);
	});
});
