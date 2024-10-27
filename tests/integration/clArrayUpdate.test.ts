import { expect, test } from 'vitest';

import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';
import { roboChimpSyncData } from '../../src/lib/roboChimp';
import { createTestUser } from './util';

test('CL Updates', async () => {
	const user = await createTestUser();
	await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
	await roboChimpSyncData(user);
	expect(await user.fetchStats({ cl_array: true, cl_array_length: true })).toMatchObject({
		cl_array: [],
		cl_array_length: 0
	});

	await user.addItemsToBank({ items: new Bank().add('Egg', 100), collectionLog: true });
	await roboChimpSyncData(user);
	expect(await user.fetchStats({ cl_array: true, cl_array_length: true })).toMatchObject({
		cl_array: [itemID('Egg')],
		cl_array_length: 1
	});

	await user.addItemsToBank({ items: new Bank().add('Egg', 100), collectionLog: true });
	await roboChimpSyncData(user);
	expect(await user.fetchStats({ cl_array: true, cl_array_length: true })).toMatchObject({
		cl_array: [itemID('Egg')],
		cl_array_length: 1
	});

	await user.addItemsToBank({ items: new Bank().add('Trout', 100), collectionLog: true });
	await roboChimpSyncData(user);
	expect(await user.fetchStats({ cl_array: true, cl_array_length: true })).toMatchObject({
		cl_array: [itemID('Trout'), itemID('Egg')],
		cl_array_length: 2
	});
});
