import { GLOBAL_BSO_XP_MULTIPLIER } from '@/lib/bso/bsoConstants.js';

import { randArrItem, randInt } from '@oldschoolgg/rng';
import { objectEntries, Time } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import { Bank, convertLVLtoXP, convertXPtoLVL } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { ClueTiers } from '../../src/lib/clues/clueTiers.js';
import { assert } from '../../src/lib/util/logError.js';
import { createTestUser } from './util.js';

async function stressTest(userID: string) {
	const user = await mUserFetch(userID);
	const currentBank = user.bank;
	const currentGP = user.GP;
	const gpBank = new Bank().add('Coins', currentGP);
	async function assertGP(amnt: number) {
		await user.sync();
		assert(Number(user.GP) === amnt, `1 GP should match ${amnt} === ${Number(user.GP)}`);
	}
	async function assertBankMatches() {
		const currentBank = user.bank.clone();
		await user.sync();
		const mahojiBank = user.bank;
		assert(mahojiBank.equals(currentBank), 'Mahoji bank should match');
		assert(mahojiBank.equals(currentBank), `Updated bank should match: ${mahojiBank.difference(currentBank)}`);
		assert(currentGP === Number(user.GP), `2 GP should match ${currentGP} === ${Number(user.GP)}`);
	}

	await user.sync();
	const currentCL = user.cl.clone();

	await assertBankMatches();

	await user.transactItems({ itemsToRemove: currentBank, filterLoot: false });
	await user.transactItems({ itemsToAdd: currentBank, filterLoot: false });
	await assertBankMatches();
	await user.removeItemsFromBank(currentBank);
	await assertGP(currentGP);
	await user.addItemsToBank({ items: currentBank, filterLoot: false });
	await assertGP(currentGP);
	await user.removeItemsFromBank(currentBank);
	await user.addItemsToBank({ items: currentBank, filterLoot: false });
	await assertBankMatches();

	await assertGP(currentGP);
	await user.transactItems({ itemsToRemove: gpBank, filterLoot: false });
	await assertGP(0);
	await user.transactItems({ itemsToAdd: gpBank, filterLoot: false });
	await assertBankMatches();
	await assertGP(currentGP);

	// Adding and removing at same time
	const everything = currentBank.clone().add(gpBank);
	await user.transactItems({ itemsToRemove: everything, itemsToAdd: everything, filterLoot: false });
	await assertBankMatches();

	// Collection Log
	const clBankChange = new Bank().add('Coins').add('Twisted bow').freeze();
	await user.sync();
	assert(currentCL.equals(user.cl));
	const { previousCL, newCL } = await user.transactItems({
		itemsToAdd: clBankChange,
		collectionLog: true,
		filterLoot: false
	});
	assert(newCL.equals(currentCL.clone().add(clBankChange)), 'Should match 2');
	assert(previousCL.equals(currentCL), 'Should match 3');
	await user.removeItemsFromBank(clBankChange);

	await assertBankMatches();
	await assertGP(currentGP);

	const specialRemoveBank = new Bank().add('Egg').add('Twisted bow', 100);
	await user.addItemsToBank({ items: specialRemoveBank });
	await user.specialRemoveItems(specialRemoveBank);
}

describe('MUser', () => {
	test('Should pass stress test', async () => {
		const firstUser = await createTestUser();
		const secondUser = await createTestUser();
		await Promise.all([stressTest(firstUser.id), stressTest(secondUser.id)]);
	});

	test('Should add XP', async () => {
		const user = await createTestUser();
		expect(user.skillsAsLevels.agility).toEqual(1);
		const result = await user.addXP({ skillName: 'agility', amount: 1000 });
		expect(user.skillsAsLevels.agility).toEqual(20);
		const xpMultiplied = 1000 * GLOBAL_BSO_XP_MULTIPLIER;
		expect(result).toEqual(`You received ${xpMultiplied.toLocaleString()} <:agility:630911040355565568> XP.
**Congratulations! Your Agility level is now 20** 🎉`);
		const xpAdded = await global.prisma!.xPGain.findMany({
			where: {
				user_id: BigInt(user.id),
				skill: 'agility',
				xp: xpMultiplied
			}
		});
		expect(xpAdded.length).toEqual(1);
		expect(xpAdded[0].xp).toEqual(xpMultiplied);
	});

	test('skillsAsLevels/skillsAsXP', async () => {
		const user = await createTestUser();
		for (const [key, val] of objectEntries(user.skillsAsLevels)) {
			const expectedVal = key === 'hitpoints' ? 10 : 1;
			expect(val).toEqual(expectedVal);
		}
		for (const [key, val] of objectEntries(user.skillsAsXP)) {
			const expectedVal = key === 'hitpoints' ? convertLVLtoXP(10) : convertLVLtoXP(1);
			expect(val).toEqual(expectedVal);
		}

		const xpToAdd = convertLVLtoXP(50);
		const expectedLevel = convertXPtoLVL(xpToAdd * GLOBAL_BSO_XP_MULTIPLIER);
		await user.addXP({ skillName: 'agility', amount: convertLVLtoXP(50) });
		await user.addXP({ skillName: 'attack', amount: convertLVLtoXP(expectedLevel) });

		expect(user.skillsAsLevels.agility).toEqual(expectedLevel);
		expect(user.skillsAsLevels.attack).toEqual(expectedLevel);
		expect(user.skillsAsXP.agility).toEqual(convertLVLtoXP(expectedLevel));
		expect(user.skillsAsXP.attack).toEqual(convertLVLtoXP(expectedLevel));
	});

	test('addItemsToCollectionLog', async () => {
		const user = await createTestUser();
		const loot = new Bank().add('Coal', 73);
		{
			const { newCL, itemsAdded, previousCL } = await user.addItemsToCollectionLog(loot);
			expect(newCL.equals(loot)).toEqual(true);
			expect(previousCL.equals(new Bank())).toEqual(true);
			expect(itemsAdded).toEqual(loot);
		}

		{
			const { newCL, itemsAdded, previousCL } = await user.addItemsToCollectionLog(loot);
			expect(newCL.equals(loot.clone().multiply(2))).toEqual(true);
			expect(previousCL.equals(loot)).toEqual(true);
			expect(itemsAdded).toEqual(loot);
		}
	});

	test('calcActualClues', async () => {
		const user = await createTestUser();
		const clues = [];
		for (let i = 0; i < 100; i++) {
			const tier = randArrItem(ClueTiers);
			clues.push({
				id: randInt(1, 100_000_000),
				user_id: BigInt(user.id),
				start_date: new Date(Date.now() - Time.Hour),
				duration: Time.Hour,
				finish_date: new Date(),
				completed: true,
				type: activity_type_enum.ClueCompletion,
				channel_id: BigInt(1),
				group_activity: false,
				data: {
					userID: user.id,
					ci: tier.id,
					q: randInt(1, 10)
				}
			});
		}
		await prisma.activity.createMany({
			data: clues
		});
		await user.calcActualClues();
	});
});
