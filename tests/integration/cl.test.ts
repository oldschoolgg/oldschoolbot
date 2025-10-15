import { Bank, EItem, Items } from 'oldschooljs';
import { afterAll, describe, expect, it } from 'vitest';

import { TableBankManager } from '@/lib/tableBankManager.js';
import { createTestUser } from './util.js';

describe('updateCL()', () => {
	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('inserts rows from empty collection log', async () => {
		const user = await createTestUser();
		await user.updateCL();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(0);
	});

	it('creates correct rows from collectionLogBank JSON', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);

		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(2);
		expect(cl.has(EItem.TWISTED_BOW)).toBe(true);
		expect(cl.has(EItem.ABYSSAL_WHIP)).toBe(true);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(1);
		expect(cl.amount(EItem.ABYSSAL_WHIP)).toBe(1);
	});

	it('updates quantities if same items are reinserted', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 3);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(1);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(3);

		const newBank = new Bank().add(EItem.TWISTED_BOW, 5);
		await user.update({ collectionLogBank: newBank.toJSON() });
		await user.updateCL();

		cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(1);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(5);
	});

	it('removes deleted items correctly', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(2);

		const newBank = new Bank().add(EItem.TWISTED_BOW, 1);
		await user.update({ collectionLogBank: newBank.toJSON() });
		expect(user.cl.length).toBe(1);
		await user.updateCL();

		cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(1);
		expect(cl.has(EItem.TWISTED_BOW)).toBe(true);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(1);
		expect(cl.amount(EItem.ABYSSAL_WHIP)).toBe(0);
	});

	it('handles large banks efficiently', async () => {
		const user = await createTestUser();
		const bank = new Bank();
		for (let i = 0; i < 2000; i++) bank.add(1000 + i, 1);
		await user.update({ collectionLogBank: bank.toJSON() });

		const t0 = performance.now();
		await user.updateCL();
		const t1 = performance.now();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(2000);
		expect(t1 - t0).toBeLessThan(500);
	});

	it('deletes all rows when collectionLogBank is {}', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(2);

		await user.update({ collectionLogBank: {} });
		await user.updateCL();

		cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(0);
	});

	it('deletes all rows when collectionLogBank is NULL', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(1);

		await prisma.user.update({ where: { id: user.id }, data: { collectionLogBank: {} } });
		await user.updateCL();

		cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(0);
	});

	it('sanitizes non-positive quantities to 1', async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: {
				collectionLogBank: {
					[EItem.TWISTED_BOW]: 0,
					[EItem.ABYSSAL_WHIP]: -3
				} as any
			}
		});
		await user.updateCL();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(2);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(1);
		expect(cl.amount(EItem.ABYSSAL_WHIP)).toBe(1);
	});

	it('isolation: updating one user does not affect another', async () => {
		const [a, b] = await Promise.all([createTestUser(), createTestUser()]);

		await a.update({ collectionLogBank: new Bank().add(EItem.TWISTED_BOW, 1).toJSON() });
		await b.update({ collectionLogBank: new Bank().add(EItem.ABYSSAL_WHIP, 1).toJSON() });

		await a.updateCL();
		await b.updateCL();

		const [aCL, bCL] = await Promise.all([
			TableBankManager.fetch({ userId: a.id, type: 'CollectionLog' }),
			TableBankManager.fetch({ userId: b.id, type: 'CollectionLog' })
		]);

		expect(aCL.itemIDs).toEqual([EItem.TWISTED_BOW]);
		expect(bCL.itemIDs).toEqual([EItem.ABYSSAL_WHIP]);
	});

	it('replaces with a disjoint set exactly (no stale rows)', async () => {
		const user = await createTestUser();
		const first = new Bank();
		for (let i = 0; i < 50; i++) first.add(10_000 + i, 1);
		await user.update({ collectionLogBank: first.toJSON() });
		await user.updateCL();

		let cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(50);

		const second = new Bank();
		for (let i = 0; i < 30; i++) second.add(20_000 + i, 1);
		await user.update({ collectionLogBank: second.toJSON() });
		await user.updateCL();

		cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(30);
		expect(cl.itemIDs.every(id => id >= 20_000 && id < 20_030)).toBe(true);
	});

	it('large delete is efficient', async () => {
		const user = await createTestUser();
		const bank = new Bank();
		for (let i = 0; i < 2500; i++) bank.add(30_000 + i, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		const t0 = performance.now();
		await user.update({ collectionLogBank: {} });
		await user.updateCL();
		const t1 = performance.now();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.length).toBe(0);
		expect(t1 - t0).toBeLessThan(200);
	});

	it('caps >int32 to INT_MAX and does not throw', async () => {
		const user = await createTestUser();
		const INT_MAX = 2_147_483_647;
		await prisma.user.update({
			where: { id: user.id },
			data: { collectionLogBank: { [EItem.TWISTED_BOW]: INT_MAX + 246 } as any }
		});

		await expect(user.updateCL()).resolves.toBeUndefined();

		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(INT_MAX);
	});

	it('exact test', async () => {
		const user = await createTestUser();
		const testCl = new Bank();
		for (let i = 0; i < 10_000; i++) {
			if (testCl.length === 5000) break;
			if (!Items.has(i + 1)) continue;
			testCl.add(i + 1, 1);
		}
		testCl.freeze();

		expect(testCl.length).toBe(5000);

		await user.update({ collectionLogBank: testCl.toJSON() });
		await user.updateCL();
		const cl3 = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl3.length).toBe(5000);

		const nextTestCL = testCl.clone();
		for (const [item, qty] of cl3.items()) {
			expect(qty).toBe(1);
			nextTestCL.add(item.id, 5);
		}
		await user.update({ collectionLogBank: nextTestCL.toJSON() });
		await user.updateCL();
		const cl2 = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl2.length).toBe(5000);
		for (const [item, qty] of cl2.items()) {
			expect(testCl.has(item.id)).toBe(true);
			expect(qty).toBe(6);
		}

		const anotherCL = nextTestCL.clone();
		const itemIdToRemove = Math.max(...anotherCL.itemIDs);
		anotherCL.remove(itemIdToRemove, 3);
		await user.update({ collectionLogBank: anotherCL.toJSON() });
		await user.updateCL();
		const cl = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(cl.amount(itemIdToRemove)).toEqual(3);
		anotherCL.remove(itemIdToRemove, 3);

		await user.update({ collectionLogBank: anotherCL.toJSON() });
		await user.updateCL();
		const newCL = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
		expect(newCL.amount(itemIdToRemove)).toBe(0);
		expect(newCL.length).toEqual(4999);
	});
});
