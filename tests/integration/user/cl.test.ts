import { Bank, EItem } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser } from '../util.js';

describe('updateCL()', { repeats: 5 }, () => {
	it('inserts rows from empty collection log', async () => {
		const user = await createTestUser();
		const cl = await user.fetchCL();
		expect(cl.length).toBe(0);
	});

	it('creates correct rows from collectionLogBank JSON', async () => {
		const user = await createTestUser();

		await user.addItemsToCollectionLog(new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.ABYSSAL_WHIP, 1));
		const cl = await user.fetchCL();
		expect(cl.length).toBe(2);
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(1);
		expect(cl.amount(EItem.ABYSSAL_WHIP)).toBe(1);

		await user.addItemsToCollectionLog(new Bank().add(EItem.TWISTED_BOW, 1).add(EItem.EGG, 1));
		const cl2 = await user.fetchCL();
		expect(cl2.length).toBe(3);
		expect(cl2.amount(EItem.TWISTED_BOW)).toBe(2);
		expect(cl2.amount(EItem.EGG)).toBe(1);
		expect(cl2.amount(EItem.ABYSSAL_WHIP)).toBe(1);
	});

	it('adding items to bank should alter cls', async () => {
		const u = await createTestUser();
		await u.addItemsToBank({ items: new Bank().add(EItem.ABYSSAL_WHIP, 1), collectionLog: true });
		expect(u.cl).toHaveLength(1);
		const tableBank = await prisma.tableBank.findFirstOrThrow({
			where: { user_id: u.id, type: 'CollectionLog' }
		});
		expect(await prisma.tableBankItem.count({ where: { bank_id: tableBank.id } })).toBe(1);
		const tCL = await u.fetchCL();
		expect(tCL.toJSON()).toStrictEqual(tCL.toJSON());
		expect(tCL.itemIDs).toEqual([EItem.ABYSSAL_WHIP]);
	});

	it('should add to cl when items added with transactItems', async () => {
		const u = await createTestUser();
		await u.transactItems({ itemsToAdd: new Bank().add(EItem.ABYSSAL_WHIP, 1), collectionLog: true });
		expect(u.cl).toHaveLength(1);
		const tableBank = await prisma.tableBank.findFirstOrThrow({
			where: { user_id: u.id, type: 'CollectionLog' }
		});
		expect(await prisma.tableBankItem.count({ where: { bank_id: tableBank.id } })).toBe(1);
		const tCL = await u.fetchCL();
		expect(tCL.toJSON()).toStrictEqual(tCL.toJSON());
		expect(tCL.itemIDs).toEqual([EItem.ABYSSAL_WHIP]);
	});

	it('shouldnt add to cl when items added with transactItems(false)', async () => {
		const u = await createTestUser();
		await u.addItemsToBank({ items: new Bank().add(EItem.ABYSSAL_WHIP, 1), collectionLog: false });
		expect(u.cl).toHaveLength(0);
		const tCL = await u.fetchCL();
		expect(tCL.itemIDs).toEqual([]);
		expect(tCL).toHaveLength(0);

		await u.addItemsToBank({ items: new Bank().add(EItem.EGG, 1), collectionLog: true });
		expect(await u.fetchCL()).toHaveLength(1);
		expect(u.cl.itemIDs).toEqual([EItem.EGG]);

		await u.addItemsToBank({ items: new Bank().add(EItem.EGG, 1), collectionLog: false });
		expect(await u.fetchCL()).toHaveLength(1);
		expect(u.cl.itemIDs).toEqual([EItem.EGG]);

		await u.addItemsToBank({ items: new Bank().add(EItem.TROUT, 1).add(EItem.EGG, 1), collectionLog: true });
		expect(await u.fetchCL()).toHaveLength(2);
		expect(u.cl.toString()).toEqual(`2x Egg, 1x Trout`);
	});

	it('shouldnt add items to cl with addItemsToBank(false)', async () => {
		const u = await createTestUser();
		await u.addItemsToBank({ items: new Bank().add(EItem.ABYSSAL_WHIP, 1), collectionLog: false });
		expect(u.cl).toHaveLength(0);
		const tCL = await u.fetchCL();
		expect(tCL.itemIDs).toEqual([]);
		expect(tCL).toHaveLength(0);

		await u.addItemsToBank({ items: new Bank().add(EItem.EGG, 1), collectionLog: true });
		expect(await u.fetchCL()).toHaveLength(1);
		expect(u.cl.itemIDs).toEqual([EItem.EGG]);

		await u.addItemsToBank({ items: new Bank().add(EItem.EGG, 1), collectionLog: false });
		expect(await u.fetchCL()).toHaveLength(1);
		expect(u.cl.itemIDs).toEqual([EItem.EGG]);

		await u.addItemsToBank({ items: new Bank().add(EItem.TROUT, 1).add(EItem.EGG, 1), collectionLog: true });
		expect(await u.fetchCL()).toHaveLength(2);
		expect(u.cl.toString()).toEqual(`2x Egg, 1x Trout`);
	});

	it('isolation: updating one user does not affect another', async () => {
		const [a, b] = await Promise.all([createTestUser(), createTestUser()]);

		await a.addItemsToCollectionLog(new Bank().add(EItem.TWISTED_BOW, 1));
		await b.addItemsToBank({ items: new Bank().add(EItem.ABYSSAL_WHIP, 1), collectionLog: true });

		const [aCL, bCL] = await Promise.all([a.fetchCL(), b.fetchCL()]);

		expect(a.cl).toHaveLength(1);
		expect(b.cl).toHaveLength(1);

		expect(aCL.itemIDs).toEqual([EItem.TWISTED_BOW]);
		expect(bCL.itemIDs).toEqual([EItem.ABYSSAL_WHIP]);

		expect((await a.fetchCL()).toJSON()).toStrictEqual(a.cl.toJSON());
		expect((await b.fetchCL()).toJSON()).toStrictEqual(b.cl.toJSON());
	});

	it('handles huge numbers', async () => {
		const user = await createTestUser();
		const HUGE_NUM = 12_147_483_647;
		await user.addItemsToCollectionLog(new Bank().add(EItem.TWISTED_BOW, HUGE_NUM));

		const cl = await user.fetchCL();
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(HUGE_NUM);
	});

	it('handles initial creation', async () => {
		const user = await createTestUser();
		await user.update({ collectionLogBank: new Bank().add(EItem.TWISTED_BOW).add(EItem.COAL, 100).toJSON() });
		expect(await user.fetchCL()).toHaveLength(2);
		expect(user.cl).toHaveLength(2);

		await user.addItemsToBank({
			items: new Bank().add(EItem.TWISTED_BOW).add(EItem.COAL, 100).add(EItem.EGG),
			collectionLog: true
		});

		const cl = await user.fetchCL();
		expect(cl.amount(EItem.TWISTED_BOW)).toBe(2);
		expect(cl.amount(EItem.COAL)).toBe(200);
		expect(cl.amount(EItem.EGG)).toBe(1);
		expect(cl.length).toBe(3);

		expect(cl.equals(user.cl)).toBe(true);
	});
});
