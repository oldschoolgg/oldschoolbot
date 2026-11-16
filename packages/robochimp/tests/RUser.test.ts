import { PerkTier } from '@oldschoolgg/toolkit';
import type { User } from '@prisma/robochimp';
import { describe, expect, test } from 'vitest';

import { RUser } from '@/structures/RUser.js';
import { Bits } from '@/util.js';
import { mockUser } from './util.js';

describe('RUser', async () => {
	test('isMod', async () => {
		const user = mockUser();
		expect(user.isMod()).toBe(false);
		await user.update({ bits: [Bits.Moderator] });
		expect(user.isMod()).toBe(true);
		await user.update({ bits: [Bits.Admin] });
		expect(user.isMod()).toBe(true);
		await user.update({ bits: [] });
		expect(user.isMod()).toBe(false);
	});

	test('perkTier', async () => {
		const user = mockUser();
		expect(typeof user.id).toBe('bigint');
		expect(user.perkTierRaw).toBe(PerkTier.Zero);
		expect(user.perkTier).toBe(null);

		await user.update({ bits: [Bits.MagnaTier3], perk_tier: PerkTier.Two });
		expect(user.perkTierRaw).toBe(4);
		expect(user.perkTier).not.toBe(null);
		expect(user.perkTier?.perkTier).toBe(4);
		expect(user.perkTier?.bit).toBe(Bits.MagnaTier3);
	});

	test('aggregates linked user bits and highest perk tier', async () => {
		const rawUser = {
			id: 1n,
			bits: [Bits.MagnaTier1],
			perk_tier: PerkTier.Two,
			user_group_id: 'group-id'
		} as User;
		const user = new RUser(rawUser, [
			{ id: 1n, bits: [Bits.MagnaTier1, Bits.Trusted] },
			{ id: 2n, bits: [Bits.CyrTier1, Bits.Trusted] }
		]);

		expect(user.perkTierRaw).toBe(PerkTier.Two);
		expect(user.perkTier?.bit).toBe(Bits.MagnaTier1);
		expect(user.perkTierDisplay).toBe('Cyr Tier 1, Magna Tier 1');
		expect(user.bits).toEqual([Bits.MagnaTier1, Bits.Trusted, Bits.CyrTier1]);
		expect(await user.findGroup()).toEqual(['1', '2']);
	});

	test('uses highest unexpired premium tier from linked users', () => {
		const now = BigInt(Date.now());
		const user = new RUser({ id: 1n, bits: [], user_group_id: 'group-id' } as User, [
			{
				id: 1n,
				bits: [],
				premium_balance_tier: PerkTier.Six,
				premium_balance_expiry_date: now - 1n
			},
			{
				id: 2n,
				bits: [],
				premium_balance_tier: PerkTier.Three,
				premium_balance_expiry_date: now + 60_000n
			}
		]);

		expect(user.perkTierRaw).toBe(PerkTier.Three);
		expect(user.perkTierDisplay).toContain('Temp Tier: **Tier 2**');
	});

	test('displays all unexpired premium tiers from linked users', () => {
		const now = BigInt(Date.now());
		const user = new RUser({ id: 1n, bits: [], user_group_id: 'group-id' } as User, [
			{
				id: 1n,
				bits: [],
				premium_balance_tier: PerkTier.Six,
				premium_balance_expiry_date: now + 30_000n
			},
			{
				id: 2n,
				bits: [],
				premium_balance_tier: PerkTier.Three,
				premium_balance_expiry_date: now + 60_000n
			}
		]);

		expect(user.perkTierRaw).toBe(PerkTier.Six);
		expect(user.perkTierDisplay).toContain('Temp Tier: **Tier 5**');
		expect(user.perkTierDisplay).toContain('Temp Tier: Tier 2');
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
