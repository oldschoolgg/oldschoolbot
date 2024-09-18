import { Bank } from 'oldschooljs';
import { expect, test } from 'vitest';

import type { Prisma } from '@prisma/client';
import { deepClone } from 'e';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { TOBMaxMeleeGear } from '../../src/lib/data/tob';
import { repairBrokenItemsFromUser } from '../../src/lib/util/repairBrokenItems';
import resolveItems from '../../src/lib/util/resolveItems';
import { createTestUser, mockClient } from './util';

test('Repair Bank', async () => {
	await mockClient();
	const user = await createTestUser();
	const bank = new Bank().add('Coins', 1000).add('Coal', 100).add('Egg', 50).add('Trout', 999);
	const gear = TOBMaxMeleeGear.clone().raw();
	gear[EquipmentSlot.Body] = null;
	const cl = bank.clone();
	const temp_cl = bank.clone();
	const favoriteItems = resolveItems(['Coins', 'Coal', 'Egg', 'Trout']);
	const expectedData: Parameters<(typeof user)['update']>['0'] = {
		bank: bank.toJSON(),
		collectionLogBank: cl.toJSON(),
		temp_cl: temp_cl.toJSON(),
		favoriteItems: favoriteItems,
		gear_fashion: gear as any as Prisma.InputJsonValue,
		gear_melee: gear as any as Prisma.InputJsonValue,
		gear_mage: gear as any as Prisma.InputJsonValue,
		gear_range: gear as any as Prisma.InputJsonValue,
		gear_misc: {}
	};
	await user.update(expectedData);
	expect(user.user).toMatchObject(expectedData);
	expect(await repairBrokenItemsFromUser(user)).toEqual('You have no broken items on your account!');
	expect(user.user).toMatchObject(expectedData);

	const brokenData: any = deepClone(expectedData);
	brokenData.bank[3535] = 5;
	brokenData.collectionLogBank[33333] = 5;
	brokenData.temp_cl[8888888] = 5;
	brokenData.favoriteItems.push(9999999);
	brokenData.gear_fashion[EquipmentSlot.Body] = { item: 353535, quantity: 1 };
	brokenData.gear_range[EquipmentSlot.Body] = { item: 222222, quantity: 1 };
	brokenData.gear_misc[EquipmentSlot.Body] = { item: 3111111, quantity: 1 };

	const newUser = await prisma.user.update({
		where: {
			id: user.id
		},
		data: brokenData
	});
	user.user = newUser;

	expect(await repairBrokenItemsFromUser(user)).toContain('broken items in your bank/collection log/favorites/gea');
	expect(user.user).toMatchObject(expectedData);
	await user.sync();
	expect(user.user).toMatchObject(expectedData);
	const copyUser = await mUserFetch(user.id);
	expect(copyUser.user).toMatchObject(expectedData);
	expect(user.user.bank).toStrictEqual(expectedData.bank);
	expect(user.gear.fashion.allItems(false).sort()).toStrictEqual(
		resolveItems([
			'Torva full helm',
			'Amulet of torture',
			'Tzkal cape',
			'Torva gloves',
			'Torva platelegs',
			'Torva boots',
			'Drygore longsword',
			'Offhand drygore longsword',
			'Ignis ring (i)'
		]).sort()
	);
	expect(user.gear.range.allItems(false).sort()).toStrictEqual(
		resolveItems([
			'Torva full helm',
			'Amulet of torture',
			'Tzkal cape',
			'Torva gloves',
			'Torva platelegs',
			'Torva boots',
			'Drygore longsword',
			'Offhand drygore longsword',
			'Ignis ring (i)'
		]).sort()
	);
	expect(user.gear.misc.allItems(false).sort()).toStrictEqual(resolveItems([]));
});
