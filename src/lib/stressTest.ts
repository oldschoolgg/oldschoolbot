import { Bank } from 'oldschooljs';

import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import { ItemBank } from './types';
import { assert } from './util';

export function bankIsEqual(bank1: Bank, bank2: Bank) {
	for (const [item, quantity] of bank1.items()) {
		if (bank2.amount(item.id) !== quantity) return false;
	}
	return (
		bank1.length === bank2.length &&
		bank1.value() === bank2.value() &&
		JSON.stringify(bank1.bank).length === JSON.stringify(bank2.bank).length
	);
}

function diffBanks(bank1: Bank, bank2: Bank) {
	return bank1.clone().remove(bank2).add(bank2.clone().remove(bank1));
}

export async function stressTest(userID: string) {
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
		assert(bankIsEqual(mahojiBank, newBank), 'Mahoji bank should match');
		assert(
			bankIsEqual(mahojiBank, currentBank),
			`Updated bank should match: ${diffBanks(mahojiBank, currentBank)}`
		);
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
	assert(
		bankIsEqual(currentCL, await fetchCL()),
		`CL should not have changed ${diffBanks(currentCL, await fetchCL())}`
	);
	const { previousCL, newCL } = await transactItems({
		userID,
		itemsToAdd: clBankChange,
		collectionLog: true,
		filterLoot: false
	});
	assert(bankIsEqual(newCL, currentCL.clone().add(clBankChange)), 'Should match 2');
	assert(bankIsEqual(previousCL, currentCL), 'Should match 3');
	await user.removeItemsFromBank(clBankChange);

	await assertBankMatches();
	await assertGP(currentGP);

	return 'Success';
}
