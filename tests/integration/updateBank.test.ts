import { GLOBAL_BSO_XP_MULTIPLIER } from '@/lib/bso/bsoConstants.js';

import { Bank, EMonster, type ItemBank } from 'oldschooljs';
import { describe, expect, it, test, vi } from 'vitest';

import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { createTestUser } from './util.js';

describe('UpdateBank', { repeats: 5 }, async () => {
	it('should add kc', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.kcBank.add(EMonster.MAN, 69);
		updateBank.kcBank.add(EMonster.COW, 6);
		await updateBank.transact(user);
		expect(await user.getKC(EMonster.MAN)).toBe(69);
		expect(await user.getKC(EMonster.COW)).toBe(6);

		// Repeat
		const updateBank2 = new UpdateBank();
		updateBank2.userStats.ash_sanctifier_prayer_xp = 123;
		updateBank2.userStats.sell_gp = { increment: 10 };
		updateBank2.kcBank.add(EMonster.MAN, 69);
		updateBank2.kcBank.add(EMonster.COW, 6);
		await updateBank2.transact(user);
		expect(await user.getKC(EMonster.MAN)).toBe(69 * 2);
		expect(await user.getKC(EMonster.COW)).toBe(6 * 2);
		const stats = await user.fetchStats();
		expect(Number(stats.ash_sanctifier_prayer_xp)).toBe(123);
		expect(Number(stats.sell_gp)).toBe(10);
	});

	it('should add xp', async () => {
		const user = await createTestUser();
		await user.update({});
		const updateBank = new UpdateBank();
		updateBank.xpBank.add('slayer', 555);
		updateBank.xpBank.add('attack', 123);
		updateBank.xpBank.add('attack', 123, { source: 'AerialFishing' });
		updateBank.xpBank.add('strength', 123);
		await updateBank.transact(user);
		await user.sync();

		expect(user.skillsAsXP.slayer).toBe(555 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(user.skillsAsXP.attack).toBe(123 * 2 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(user.skillsAsXP.strength).toBe(123 * GLOBAL_BSO_XP_MULTIPLIER);
	});

	it('should add/remove items', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
		const updateBank = new UpdateBank();
		updateBank.itemCostBank.add('Coal', 50);
		updateBank.itemLootBank.add('Egg', 50);
		updateBank.itemLootBankNoCL.add('Trout', 50);
		await updateBank.transact(user);
		await user.sync();

		expect(user.bank.amount('Coal')).toBe(50);
		expect(user.bank.amount('Egg')).toBe(50);
		expect(user.bank.amount('Trout')).toBe(50);
		expect(user.cl.amount('Trout')).toBe(0);
		expect(user.cl.amount('Egg')).toBe(50);
	});

	it('should add items with no cl', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.itemLootBankNoCL.add('Trout', 50);
		await updateBank.transact(user);
		expect(user.bank.amount('Trout')).toBe(50);
		expect(user.cl.amount('Trout')).toBe(0);
	});

	it('should remove charges', async () => {
		const user = await createTestUser();
		await user.update({
			tum_shadow_charges: 1000,
			tentacle_charges: 1000,
			sang_charges: 1000
		});
		expect(user.user.tum_shadow_charges).toBe(1000);
		expect(user.user.tentacle_charges).toBe(1000);
		const updateBank = new UpdateBank();
		updateBank.kcBank.add(EMonster.COW, 5);
		updateBank.chargeBank.add('tum_shadow_charges', 500);
		updateBank.chargeBank.add('tentacle_charges', 500);
		await updateBank.transact(user);
		expect(user.user.tum_shadow_charges).toBe(500);
		expect(user.user.tentacle_charges).toBe(500);
		expect(user.user.sang_charges).toBe(1000);
		expect(await user.getKC(EMonster.COW)).toBe(5);
	});

	it('should add xp', async () => {
		const user = await createTestUser();
		await user.update({});
		const updateBank = new UpdateBank();
		updateBank.xpBank.add('slayer', 555);
		updateBank.kcBank.add(EMonster.COW, 5);
		updateBank.xpBank.add('attack', 123);
		updateBank.xpBank.add('attack', 123, { source: 'AerialFishing' });
		updateBank.xpBank.add('strength', 123);
		await updateBank.transact(user);
		await user.sync();

		expect(user.skillsAsXP.slayer).toBe(555 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(user.skillsAsXP.attack).toBe(123 * 2 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(user.skillsAsXP.strength).toBe(123 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(await user.getKC(EMonster.COW)).toBe(5);
	});

	it('should add/remove items', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
		const updateBank = new UpdateBank();
		updateBank.itemCostBank.add('Coal', 50);
		updateBank.itemLootBank.add('Egg', 50);
		updateBank.kcBank.add(EMonster.COW, 5);
		updateBank.kcBank.add(EMonster.ABERRANT_SPECTRE, 5);
		updateBank.itemLootBankNoCL.add('Trout', 50);
		await updateBank.transact(user);
		await user.sync();

		expect(user.bank.amount('Coal')).toBe(50);
		expect(user.bank.amount('Egg')).toBe(50);
		expect(user.bank.amount('Trout')).toBe(50);
		expect(user.cl.amount('Trout')).toBe(0);
		expect(user.cl.amount('Egg')).toBe(50);
		expect(await user.getKC(EMonster.COW)).toBe(5);
		expect(await user.getKC(EMonster.ABERRANT_SPECTRE)).toBe(5);
	});

	it('should add items with no cl', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.itemLootBankNoCL.add('Trout', 50);
		await updateBank.transact(user);
		expect(user.bank.amount('Trout')).toBe(50);
		expect(user.cl.amount('Trout')).toBe(0);
	});

	it('should update user stats', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.userStats.ash_sanctifier_prayer_xp = 123;
		updateBank.userStats.gp_luckypick = {
			increment: 100
		};
		updateBank.userStatsBankUpdates.buy_cost_bank = new Bank().add('Trout', 50);
		await updateBank.transact(user);
		const stats = await prisma.userStats.findFirstOrThrow({
			where: {
				user_id: BigInt(user.id)
			}
		});
		expect(Number(stats.ash_sanctifier_prayer_xp)).toBe(123);
		expect(Number(stats.gp_luckypick)).toBe(100);
		expect(new Bank(stats.buy_cost_bank as ItemBank).equals(new Bank().add('Trout', 50))).toBeTruthy();

		// Second update
		const secondUpdateBank = new UpdateBank();
		secondUpdateBank.userStats.ash_sanctifier_prayer_xp = {
			increment: 50
		};
		secondUpdateBank.userStatsBankUpdates.buy_cost_bank = new Bank().add('Trout', 50).add('Shark', 50);
		await secondUpdateBank.transact(user);

		const res = new Bank((await user.fetchStats()).buy_cost_bank as ItemBank);
		expect(res.equals(new Bank().add('Trout', 100).add('Shark', 50))).toBeTruthy();
		expect(Number(stats.ash_sanctifier_prayer_xp)).toBe(123);
		expect(Number(stats.gp_luckypick)).toBe(100);
	});

	test('stress test', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
		const updateBank = new UpdateBank();
		updateBank.userStats.ash_sanctifier_prayer_xp = 123;
		updateBank.userStats.gp_luckypick = {
			increment: 100
		};
		updateBank.userStatsBankUpdates.buy_cost_bank = new Bank().add('Trout', 50);
		updateBank.itemCostBank.add('Coal', 50);
		updateBank.itemLootBank.add('Egg', 50);
		updateBank.itemLootBankNoCL.add('Trout', 50);
		updateBank.xpBank.add('slayer', 555);
		updateBank.xpBank.add('attack', 555);
		await updateBank.transact(user);
		expect(user.bank.amount('Coal')).toBe(50);
		expect(user.bank.amount('Egg')).toBe(50);
		expect(user.bank.amount('Trout')).toBe(50);
		expect(user.cl.amount('Trout')).toBe(0);
		expect(user.skillsAsXP.attack).toEqual(555 * GLOBAL_BSO_XP_MULTIPLIER);
		expect(user.skillsAsXP.slayer).toEqual(555 * GLOBAL_BSO_XP_MULTIPLIER);
	});

	it('no-op: returns empty result and does nothing', async () => {
		const user = await createTestUser();
		const before = {
			xp: { ...user.skillsAsXP },
			bank: user.bank.clone(),
			cl: user.cl.clone()
		};
		const res: any = await new UpdateBank().transact(user);
		expect(res.itemTransactionResult).toBeNull();
		expect(res.totalCost.equals(new Bank())).toBeTruthy();
		expect(res.message).toBe('');
		expect(user.bank.equals(before.bank)).toBeTruthy();
		expect(user.cl.equals(before.cl)).toBeTruthy();
		expect(user.skillsAsXP).toEqual(before.xp);
	});

	it('fails when lacking charges', async () => {
		const user = await createTestUser();
		await user.update({
			tum_shadow_charges: 0,
			tentacle_charges: 0
		});
		const ub = new UpdateBank();
		ub.chargeBank.add('tum_shadow_charges', 5);
		const res = await ub.transact(user);
		expect(typeof res).toBe('string');
		// unchanged
		expect(user.user.tum_shadow_charges).toBe(0);
	});

	it('fails when lacking itemCostBank items', async () => {
		const user = await createTestUser();
		const ub = new UpdateBank();
		ub.itemCostBank.add('Coal', 1);
		const res = await ub.transact(user);
		expect(typeof res).toBe('string');
		expect(String(res)).toContain('You need these items:');
	});

	it('passes isInWilderness through to specialRemoveItems', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 10) });
		const spy = vi.spyOn(user, 'specialRemoveItems');
		const ub = new UpdateBank();
		ub.itemCostBank.add('Coal', 3);
		await ub.transact(user, { isInWilderness: true });
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy.mock.calls[0]?.[1]).toMatchObject({ isInWilderness: true });
	});

	it('returns itemTransactionResult and totalCost', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
		const ub = new UpdateBank();
		ub.itemCostBank.add('Coal', 50);
		ub.itemLootBank.add('Egg', 25);
		const res: any = await ub.transact(user);
		expect(res.itemTransactionResult).toBeTruthy();
		expect(res.totalCost.equals(new Bank().add('Coal', 50))).toBeTruthy();
		expect(user.bank.amount('Coal')).toBe(50);
		expect(user.bank.amount('Egg')).toBe(25);
	});

	it('userUpdates: increments slayer_points', async () => {
		const user = await createTestUser();
		await user.update({ slayer_points: 10 });
		const ub = new UpdateBank();
		ub.userUpdates = {
			slayer_points: { increment: 5 }
		};
		await ub.transact(user);
		expect(user.user.slayer_points).toBe(15);
		// second update
		const ub2 = new UpdateBank();
		ub2.userUpdates = { slayer_points: { increment: 7 } };
		await ub2.transact(user);
		expect(user.user.slayer_points).toBe(22);
	});

	it('kc: multiple monsters accumulate correctly across transactions', async () => {
		const user = await createTestUser();
		const ub = new UpdateBank();
		ub.kcBank.add(EMonster.GOBLIN, 3).add(EMonster.MAN, 2);
		await ub.transact(user);
		const ub2 = new UpdateBank();
		ub2.kcBank.add(EMonster.GOBLIN, 4).add(EMonster.MAN, 8);
		await ub2.transact(user);
		expect(await user.getKC(EMonster.GOBLIN)).toBe(7);
		expect(await user.getKC(EMonster.MAN)).toBe(10);
	});

	it('userStatsBankUpdates: merges with existing stats and preserves other fields', async () => {
		const user = await createTestUser();
		// Seed some existing stats first
		const seed = new UpdateBank();
		seed.userStatsBankUpdates.buy_cost_bank = new Bank().add('Trout', 10);
		seed.userStats = { gp_luckypick: { increment: 1 } };
		await seed.transact(user);

		const ub = new UpdateBank();
		ub.userStatsBankUpdates.buy_cost_bank = new Bank().add('Trout', 5).add('Shark', 2);
		await ub.transact(user);

		const stats = await prisma.userStats.findFirstOrThrow({
			where: { user_id: BigInt(user.id) }
		});
		const bank = new Bank(stats.buy_cost_bank as ItemBank);
		expect(bank.equals(new Bank().add('Trout', 15).add('Shark', 2))).toBeTruthy();
		expect(Number(stats.gp_luckypick)).toBe(1);
	});
});
