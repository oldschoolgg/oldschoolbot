import { Bank, EItem, Items } from 'oldschooljs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestUser } from './util.js';

describe('updateCL()', () => {
	beforeAll(async () => {
		await prisma.cLUserItem.deleteMany();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('inserts rows from empty collection log', async () => {
		const user = await createTestUser();
		await user.updateCL();

		const items = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});

		expect(items).toEqual([]);
	});

	it('creates correct rows from collectionLogBank JSON', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);

		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		const rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rows.length).toBe(2);

		const ids = rows.map(r => r.item_id).sort((a, b) => a - b);
		expect(ids).toEqual([EItem.ABYSSAL_WHIP, EItem.TWISTED_BOW]);

		for (const r of rows) expect(r.quantity).toBe(1);
	});

	it('updates quantities if same items are reinserted', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 3);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id }
		});
		expect(rows.length).toBe(1);
		expect(rows[0].quantity).toBe(3);

		// change to different quantity and re-run
		const newBank = new Bank().add(EItem.TWISTED_BOW, 5);
		await user.update({ collectionLogBank: newBank.toJSON() });
		await user.updateCL();

		rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id }
		});
		expect(rows.length).toBe(1);
		expect(rows[0].quantity).toBe(5);
	});

	it('removes deleted items correctly', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id }
		});
		expect(rows.length).toBe(2);

		// remove abyssal whip
		const newBank = new Bank().add(EItem.TWISTED_BOW, 1);
		await user.update({ collectionLogBank: newBank.toJSON() });
		expect(user.cl.length).toBe(1);
		await user.updateCL();

		rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id }
		});
		expect(rows.length).toBe(1);
		expect(rows[0].item_id).toBe(EItem.TWISTED_BOW);
	});

	it('handles large banks efficiently', async () => {
		const user = await createTestUser();
		const bank = new Bank();
		for (let i = 0; i < 2000; i++) bank.add(1000 + i, 1);
		await user.update({ collectionLogBank: bank.toJSON() });

		const t0 = performance.now();
		await user.updateCL();
		const t1 = performance.now();

		const rows = await prisma.cLUserItem.count({
			where: { user_id: user.id }
		});
		expect(rows).toBe(2000);
		expect(t1 - t0).toBeLessThan(500);
	});

	it('deletes all rows when collectionLogBank is {}', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let count = await prisma.cLUserItem.count({ where: { user_id: user.id } });
		expect(count).toBe(2);

		await user.update({ collectionLogBank: {} });
		await user.updateCL();

		count = await prisma.cLUserItem.count({ where: { user_id: user.id } });
		expect(count).toBe(0);
	});

	it('deletes all rows when collectionLogBank is NULL', async () => {
		const user = await createTestUser();
		const bank = new Bank().add(EItem.TWISTED_BOW, 1);
		await user.update({ collectionLogBank: bank.toJSON() });
		await user.updateCL();

		let count = await prisma.cLUserItem.count({ where: { user_id: user.id } });
		expect(count).toBe(1);

		await prisma.user.update({ where: { id: user.id }, data: { collectionLogBank: {} } });
		await user.updateCL();

		count = await prisma.cLUserItem.count({ where: { user_id: user.id } });
		expect(count).toBe(0);
	});

	it('sanitizes non-positive quantities to 1', async () => {
		const user = await createTestUser();
		// Write raw JSON with 0 and negative values
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

		const rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rows.length).toBe(2);
		expect(rows.find(r => r.item_id === EItem.TWISTED_BOW)?.quantity).toBe(1);
		expect(rows.find(r => r.item_id === EItem.ABYSSAL_WHIP)?.quantity).toBe(1);
	});

	it('isolation: updating one user does not affect another', async () => {
		const [a, b] = await Promise.all([createTestUser(), createTestUser()]);

		await a.update({ collectionLogBank: new Bank().add(EItem.TWISTED_BOW, 1).toJSON() });
		await b.update({ collectionLogBank: new Bank().add(EItem.ABYSSAL_WHIP, 1).toJSON() });

		await a.updateCL();
		await b.updateCL();

		const [aRows, bRows] = await Promise.all([
			prisma.cLUserItem.findMany({ where: { user_id: a.id } }),
			prisma.cLUserItem.findMany({ where: { user_id: b.id } })
		]);

		expect(aRows.map(r => r.item_id)).toEqual([EItem.TWISTED_BOW]);
		expect(bRows.map(r => r.item_id)).toEqual([EItem.ABYSSAL_WHIP]);
	});

	it('replaces with a disjoint set exactly (no stale rows)', async () => {
		const user = await createTestUser();
		const first = new Bank();
		for (let i = 0; i < 50; i++) first.add(10_000 + i, 1);
		await user.update({ collectionLogBank: first.toJSON() });
		await user.updateCL();

		let rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rows.length).toBe(50);

		const second = new Bank();
		for (let i = 0; i < 30; i++) second.add(20_000 + i, 1);
		await user.update({ collectionLogBank: second.toJSON() });
		await user.updateCL();

		rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rows.length).toBe(30);
		expect(rows.every(r => r.item_id >= 20_000 && r.item_id < 20_030)).toBe(true);
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

		const count = await prisma.cLUserItem.count({ where: { user_id: user.id } });
		expect(count).toBe(0);
		expect(t1 - t0).toBeLessThan(200);
	});

	it('caps >int32 to INT_MAX and does not throw', async () => {
		const user = await createTestUser();
		const INT_MAX = 2_147_483_647;
		await prisma.user.update({
			where: { id: user.id },
			data: {
				collectionLogBank: {
					[EItem.TWISTED_BOW]: INT_MAX + 246
				} as any
			}
		});

		await expect(user.updateCL()).resolves.toBeUndefined();

		const row = await prisma.cLUserItem.findUnique({
			where: { user_id_item_id: { user_id: user.id, item_id: EItem.TWISTED_BOW } }
		});

		expect(row).toBeTruthy();
		expect(row!.quantity).toBe(INT_MAX);
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

		await user.update({
			collectionLogBank: testCl.toJSON()
		});
		await user.updateCL();
		const rows = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rows.length).toBe(5000);

		const nextTestCL = testCl.clone();
		for (const row of rows) {
			expect(row.quantity).toBe(1);
			nextTestCL.add(row.item_id, 5);
		}
		//
		await user.update({
			collectionLogBank: nextTestCL.toJSON()
		});
		await user.updateCL();
		const rowsNext = await prisma.cLUserItem.findMany({
			where: { user_id: user.id },
			orderBy: { item_id: 'asc' }
		});
		expect(rowsNext.length).toBe(5000);
		for (const row of rowsNext) {
			expect(testCl.has(row.item_id)).toBe(true);
			expect(row.quantity).toBe(6);
		}
		//
		const anotherCL = nextTestCL.clone();
		const itemIdToRemove = Math.max(...anotherCL.itemIDs);
		anotherCL.remove(itemIdToRemove, 3);
		await user.update({
			collectionLogBank: anotherCL.toJSON()
		});
		await user.updateCL();
		const specificRow = await prisma.cLUserItem.findUnique({
			where: { user_id_item_id: { user_id: user.id, item_id: itemIdToRemove } }
		});
		expect(specificRow).toEqual({ user_id: user.id, item_id: itemIdToRemove, quantity: 3 });
		anotherCL.remove(itemIdToRemove, 3);
		//
		await user.update({
			collectionLogBank: anotherCL.toJSON()
		});
		await user.updateCL();
		const shouldBeGoneRow = await prisma.cLUserItem.findUnique({
			where: { user_id_item_id: { user_id: user.id, item_id: itemIdToRemove } }
		});
		expect(shouldBeGoneRow).toBeNull();
		expect(await prisma.cLUserItem.count({ where: { user_id: user.id } })).toEqual(4999);
	});
});
