import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { describe, expect, test } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';
import { SkillsEnum } from '../../src/lib/skilling/types';
import { assert } from '../../src/lib/util/logError';
import { mahojiUsersSettingsFetch } from '../../src/mahoji/mahojiSettings';

async function stressTest(userID: string) {
	const user = await mUserFetch(userID);
	const currentBank = user.bank;
	const currentGP = user.GP;
	const gpBank = new Bank().add('Coins', currentGP);
	async function assertGP(amnt: number) {
		const mUser = await mahojiUsersSettingsFetch(userID);
		assert(Number(mUser.GP) === amnt, `1 GP should match ${amnt} === ${Number(mUser.GP)}`);
	}
	async function assertBankMatches() {
		const newBank = user.bank;
		const mUser = await mahojiUsersSettingsFetch(userID);
		const mahojiBank = new Bank(mUser.bank as ItemBank);
		assert(mahojiBank.equals(newBank), 'Mahoji bank should match');
		assert(mahojiBank.equals(currentBank), `Updated bank should match: ${mahojiBank.difference(currentBank)}`);
		assert(currentGP === Number(mUser.GP), `2 GP should match ${currentGP} === ${Number(mUser.GP)}`);
	}
	async function fetchCL() {
		const mUser = await mahojiUsersSettingsFetch(userID);
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
		await Promise.all([stressTest('1'), stressTest('2')]);
	});

	test('Should add XP', async () => {
		const userId = '123456789';
		const user = await mUserFetch(userId);
		expect(user.skillsAsLevels.agility).toEqual(1);
		const result = await user.addXP({ skillName: SkillsEnum.Agility, amount: 1000 });
		expect(user.skillsAsLevels.agility).toEqual(9);
		expect(result).toEqual(`You received 1,000 <:agility:630911040355565568> XP
**Congratulations! Your Agility level is now 9** 🎉`);
		const xpAdded = await prisma.xPGain.findMany({
			where: {
				user_id: BigInt(userId),
				skill: 'agility',
				xp: 1000
			}
		});
		expect(xpAdded.length).toEqual(1);
		expect(xpAdded[0].xp).toEqual(1000);
	});
});
