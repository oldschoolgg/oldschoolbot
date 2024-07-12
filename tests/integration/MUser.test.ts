import { activity_type_enum } from '@prisma/client';
import { Time, objectEntries, randArrItem, randInt } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';
import { convertLVLtoXP } from 'oldschooljs/dist/util';
import { describe, expect, test } from 'vitest';

import { ClueTiers } from '../../src/lib/clues/clueTiers';

import { SkillsEnum } from '../../src/lib/skilling/types';
import { assert } from '../../src/lib/util/logError';
import { mahojiUsersSettingsFetch } from '../../src/mahoji/mahojiSettings';
import { createTestUser } from './util';

async function stressTest(userID: string) {
	const user = await mUserFetch(userID);
	const currentBank = user.bank;
	const currentGP = user.GP;
	const gpBank = new Bank().add('Coins', currentGP);
	async function assertGP(amnt: number) {
		const mUser = await mahojiUsersSettingsFetch(userID, { GP: true });
		assert(Number(mUser.GP) === amnt, `1 GP should match ${amnt} === ${Number(mUser.GP)}`);
	}
	async function assertBankMatches() {
		const newBank = user.bank;
		const mUser = await mahojiUsersSettingsFetch(userID, { bank: true, GP: true });
		const mahojiBank = new Bank(mUser.bank as ItemBank);
		assert(mahojiBank.equals(newBank), 'Mahoji bank should match');
		assert(mahojiBank.equals(currentBank), `Updated bank should match: ${mahojiBank.difference(currentBank)}`);
		assert(currentGP === Number(mUser.GP), `2 GP should match ${currentGP} === ${Number(mUser.GP)}`);
	}
	async function fetchCL() {
		const mUser = await mahojiUsersSettingsFetch(userID, { collectionLogBank: true });
		const mahojiBank = new Bank(mUser.collectionLogBank as ItemBank);
		return mahojiBank;
	}
	const currentCL = await fetchCL();

	await assertBankMatches();

	await transactItems({ userID, itemsToRemove: currentBank, filterLoot: false });
	await transactItems({ userID, itemsToAdd: currentBank, filterLoot: false });
	await assertBankMatches();
	await user.removeItemsFromBank(currentBank);
	await assertGP(currentGP);
	await user.addItemsToBank({ items: currentBank, filterLoot: false });
	await assertGP(currentGP);
	await user.removeItemsFromBank(currentBank);
	await user.addItemsToBank({ items: currentBank, filterLoot: false });
	await assertBankMatches();

	await assertGP(currentGP);
	await transactItems({ userID, itemsToRemove: gpBank, filterLoot: false });
	await assertGP(0);
	await transactItems({ userID, itemsToAdd: gpBank, filterLoot: false });
	await assertBankMatches();
	await assertGP(currentGP);

	// Adding and removing at same time
	const everything = currentBank.clone().add(gpBank);
	await transactItems({ userID, itemsToRemove: everything, itemsToAdd: everything, filterLoot: false });
	await assertBankMatches();

	// Collection Log
	const clBankChange = new Bank().add('Coins').add('Twisted bow').freeze();
	assert(currentCL.equals(await fetchCL()), `CL should not have changed ${currentCL.difference(await fetchCL())}`);
	const { previousCL, newCL } = await transactItems({
		userID,
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
		const result = await user.addXP({ skillName: SkillsEnum.Agility, amount: 1000 });
		expect(user.skillsAsLevels.agility).toEqual(9);
		expect(result).toEqual(`You received 1,000 <:agility:630911040355565568> XP.
**Congratulations! Your Agility level is now 9** 🎉`);
		const xpAdded = await global.prisma!.xPGain.findMany({
			where: {
				user_id: BigInt(user.id),
				skill: 'agility',
				xp: 1000
			}
		});
		expect(xpAdded.length).toEqual(1);
		expect(xpAdded[0].xp).toEqual(1000);
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
		await user.addXP({ skillName: SkillsEnum.Agility, amount: convertLVLtoXP(50) });
		await user.addXP({ skillName: SkillsEnum.Attack, amount: convertLVLtoXP(50) });

		expect(user.skillsAsLevels.agility).toEqual(50);
		expect(user.skillsAsLevels.attack).toEqual(50);
		expect(user.skillsAsXP.agility).toEqual(convertLVLtoXP(50));
		expect(user.skillsAsXP.attack).toEqual(convertLVLtoXP(50));
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
