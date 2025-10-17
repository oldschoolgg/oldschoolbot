import { Bank, generateRandomBank } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { TableBankManager } from '@/lib/table-banks/tableBankManager.js';
import { mockedId } from '../util.js';

describe('TableBankManager', { repeats: 5 }, () => {
	it('add + accumulate', async () => {
		const userId = mockedId();
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add('Egg', 5).add('Coal', 10)
		});
		await TableBankManager.update({ userId, itemsToAdd: new Bank().add('Egg', 3) });
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add('Egg', 8).add('Coal', 10))).toBeTruthy();
	});

	it('create/fetch empty', async () => {
		const r = await TableBankManager.fetch({ userId: 'u0', type: 'Bank' });
		expect(r.length).toBe(0);
	});

	it('add + accumulate', async () => {
		const userId = mockedId();
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add('Egg', 5).add('Coal', 10)
		});
		await TableBankManager.update({ userId, itemsToAdd: new Bank().add('Egg', 3) });
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add('Egg', 8).add('Coal', 10))).toBeTruthy();
	});

	it('remove to zero deletes row', async () => {
		const userId = mockedId();
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add(1, 5).add(2, 1)
		});
		await TableBankManager.update({ userId, itemsToRemove: new Bank().add(1, 5) });
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add(2, 1))).toBeTruthy();
	});

	it('underflow rejects', async () => {
		const userId = mockedId();
		await TableBankManager.update({ userId, itemsToAdd: new Bank().add(1, 2) });
		await expect(TableBankManager.update({ userId, itemsToRemove: new Bank().add(1, 3) })).rejects.toBeTruthy();
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add(1, 2))).toBeTruthy();
	});

	it('round-trip add then remove yields empty', async () => {
		const userId = mockedId();
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add(1, 7).add(2, 9)
		});
		await TableBankManager.update({
			userId,
			itemsToRemove: new Bank().add(1, 7).add(2, 9)
		});
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank())).toBeTruthy();
	});

	it('coalesce in one call', async () => {
		const userId = mockedId();
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add(1, 10).add(2, 1)
		});
		await TableBankManager.update({
			userId,
			itemsToAdd: new Bank().add(1, 5),
			itemsToRemove: new Bank().add(1, 13).add(2, 1)
		});
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add(1, 2))).toBeTruthy();
	});

	it('concurrent increments are atomic', async () => {
		const userId = mockedId();
		const tasks: Promise<void>[] = [];
		for (let i = 0; i < 10; i++) {
			tasks.push(TableBankManager.update({ userId, itemsToAdd: new Bank().add(1, 1) }));
		}
		await Promise.all(tasks);
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add(1, 10))).toBeTruthy();
	});

	it('bigint quantities', async () => {
		const userId = mockedId();
		const big = 2_000_000_000_000;
		await TableBankManager.update({ userId, itemsToAdd: new Bank().add(1, 1_000_000_000_000) });
		await TableBankManager.update({ userId, itemsToAdd: new Bank().add(1, 1_000_000_000_000) });
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.equals(new Bank().add(1, big))).toBeTruthy();
	});

	it('bulk insert 1k items', async () => {
		const userId = mockedId();
		const b = generateRandomBank(1000);
		await TableBankManager.update({ userId, itemsToAdd: b });
		const r = await TableBankManager.fetch({ userId, type: 'Bank' });
		expect(r.length).toBe(1000);
		expect(r.items().length).toBe(1000);
	});
});
