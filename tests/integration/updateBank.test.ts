import { Bank, EMonster } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { UpdateBank } from '../../src/lib/structures/UpdateBank';
import type { ItemBank } from '../../src/lib/types';
import { createTestUser } from './util';

describe(
	'UpdateBank',
	async () => {
		it('should add kc', async () => {
			const user = await createTestUser();
			const updateBank = new UpdateBank();
			updateBank.kcBank.add(EMonster.MAN, 69);
			await updateBank.transact(user);
			const newKC = await user.getKC(EMonster.MAN);
			expect(newKC).toBe(69);

			// Repeat
			await updateBank.transact(user);
			expect(await user.getKC(EMonster.MAN)).toBe(69 * 2);
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
			updateBank.chargeBank.add('tum_shadow_charges', 500);
			updateBank.chargeBank.add('tentacle_charges', 500);
			await updateBank.transact(user);
			expect(user.user.tum_shadow_charges).toBe(500);
			expect(user.user.tentacle_charges).toBe(500);
			expect(user.user.sang_charges).toBe(1000);
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

			expect(user.skillsAsXP.slayer).toBe(555);
			expect(user.skillsAsXP.attack).toBe(123 * 2);
			expect(user.skillsAsXP.strength).toBe(123);
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

			const res = new Bank((await user.fetchStats({ buy_cost_bank: true })).buy_cost_bank as ItemBank);
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
			expect(user.skillsAsXP.attack).toEqual(555);
			expect(user.skillsAsXP.slayer).toEqual(555);
		});
	},
	{ repeats: 5 }
);
