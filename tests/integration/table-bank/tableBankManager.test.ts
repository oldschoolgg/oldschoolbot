import { Bank, generateRandomBank } from 'oldschooljs';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { runStartupScripts } from '@/lib/startupScripts.js';
import { TableBankManager } from '@/lib/tableBankManager.js';

const SQL = {
	truncate: `
BEGIN;
TRUNCATE TABLE table_bank_item, table_bank RESTART IDENTITY CASCADE;
COMMIT;
`
};

describe('TableBankManager', () => {
	beforeAll(async () => {
		await runStartupScripts();
	});
	beforeEach(async () => {
		await prisma.$executeRawUnsafe(SQL.truncate);
	});

	it('create/fetch empty', async () => {
		const r = await TableBankManager.fetch({ userId: 'u0', type: 'Bank' });
		expect(r.length).toBe(0);
	});

	it('add + accumulate', async () => {
		await TableBankManager.update({
			userId: 'u1',
			itemsToAdd: new Bank().add('Egg', 5).add('Coal', 10)
		});
		await TableBankManager.update({ userId: 'u1', itemsToAdd: new Bank().add('Egg', 3) });
		const r = await TableBankManager.fetch({ userId: 'u1', type: 'Bank' });
		expect(r.equals(new Bank().add('Egg', 8).add('Coal', 10))).toBeTruthy();
	});

	it('add + accumulate', async () => {
		await TableBankManager.update({
			userId: 'u1',
			itemsToAdd: new Bank().add('Egg', 5).add('Coal', 10)
		});
		await TableBankManager.update({ userId: 'u1', itemsToAdd: new Bank().add('Egg', 3) });
		const r = await TableBankManager.fetch({ userId: 'u1', type: 'Bank' });
		expect(r.equals(new Bank().add('Egg', 8).add('Coal', 10))).toBeTruthy();
	});

	it('remove to zero deletes row', async () => {
		await TableBankManager.update({
			userId: 'u2',
			itemsToAdd: new Bank().add(1, 5).add(2, 1)
		});
		await TableBankManager.update({ userId: 'u2', itemsToRemove: new Bank().add(1, 5) });
		const r = await TableBankManager.fetch({ userId: 'u2', type: 'Bank' });
		expect(r.equals(new Bank().add(2, 1))).toBeTruthy();
	});

	it('underflow rejects', async () => {
		await TableBankManager.update({ userId: 'u3', itemsToAdd: new Bank().add(1, 2) });
		await expect(
			TableBankManager.update({ userId: 'u3', itemsToRemove: new Bank().add(1, 3) })
		).rejects.toBeTruthy();
		const r = await TableBankManager.fetch({ userId: 'u3', type: 'Bank' });
		expect(r.equals(new Bank().add(1, 2))).toBeTruthy();
	});

	it('round-trip add then remove yields empty', async () => {
		await TableBankManager.update({
			userId: 'u4',
			itemsToAdd: new Bank().add(1, 7).add(2, 9)
		});
		await TableBankManager.update({
			userId: 'u4',
			itemsToRemove: new Bank().add(1, 7).add(2, 9)
		});
		const r = await TableBankManager.fetch({ userId: 'u4', type: 'Bank' });
		expect(r.equals(new Bank())).toBeTruthy();
	});

	it('coalesce in one call', async () => {
		await TableBankManager.update({
			userId: 'u5',
			itemsToAdd: new Bank().add(1, 10).add(2, 1)
		});
		await TableBankManager.update({
			userId: 'u5',
			itemsToAdd: new Bank().add(1, 5),
			itemsToRemove: new Bank().add(1, 13).add(2, 1)
		});
		const r = await TableBankManager.fetch({ userId: 'u5', type: 'Bank' });
		expect(r.equals(new Bank().add(1, 2))).toBeTruthy();
	});

	it('concurrent increments are atomic', async () => {
		const tasks: Promise<void>[] = [];
		for (let i = 0; i < 10; i++) {
			tasks.push(TableBankManager.update({ userId: 'u6', itemsToAdd: new Bank().add(1, 1) }));
		}
		await Promise.all(tasks);
		const r = await TableBankManager.fetch({ userId: 'u6', type: 'Bank' });
		expect(r.equals(new Bank().add(1, 10))).toBeTruthy();
	});

	it('bigint quantities', async () => {
		const big = 2_000_000_000_000;
		await TableBankManager.update({ userId: 'u7', itemsToAdd: new Bank().add(1, 1_000_000_000_000) });
		await TableBankManager.update({ userId: 'u7', itemsToAdd: new Bank().add(1, 1_000_000_000_000) });
		const r = await TableBankManager.fetch({ userId: 'u7', type: 'Bank' });
		expect(r.equals(new Bank().add(1, big))).toBeTruthy();
	});

	it('bulk insert 1k items', async () => {
		const b = generateRandomBank(1000);
		await TableBankManager.update({ userId: 'bulk', itemsToAdd: b });
		const r = await TableBankManager.fetch({ userId: 'bulk', type: 'Bank' });
		expect(r.length).toBe(1000);
		expect(r.items().length).toBe(1000);
	});
});
