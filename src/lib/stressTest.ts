import { Bank } from 'oldschooljs';

import { OWNER_ID } from '../config';
import { mahojiUsersSettingsFetch, transactItemsFromBank } from '../mahoji/mahojiSettings';
import { UserSettings } from './settings/types/UserSettings';
import { ItemBank } from './types';
import { assert } from './util';

function bankIsEqual(bank1: Bank, bank2: Bank) {
	for (const [item, quantity] of bank1.items()) {
		if (bank2.amount(item.id) !== quantity) return false;
	}
	return (
		bank1.length === bank2.length &&
		bank1.value() === bank2.value() &&
		JSON.stringify(bank1.bank).length === JSON.stringify(bank2.bank).length
	);
}

export async function stressTest() {
	const user = await globalClient.fetchUser(OWNER_ID);
	const currentBank = user.bank();
	const currentGP = user.settings.get(UserSettings.GP);
	const gpBank = new Bank().add('Coins', currentGP);

	async function assertGP(amnt: number) {
		const mUser = await mahojiUsersSettingsFetch(OWNER_ID);
		assert(Number(mUser.GP) === amnt, `1 GP should match ${amnt} === ${Number(mUser.GP)}`);
	}
	async function assertBankMatches() {
		const newBank = user.bank();
		const mUser = await mahojiUsersSettingsFetch(OWNER_ID);
		const mahojiBank = new Bank(mUser.bank as ItemBank);
		assert(bankIsEqual(mahojiBank, newBank), 'Mahoji/Klasa bank should match');
		assert(bankIsEqual(mahojiBank, currentBank), 'Updated bank should match');
		assert(currentGP === Number(mUser.GP), `2 GP should match ${currentGP} === ${Number(mUser.GP)}`);
	}

	await assertBankMatches();

	for (let i = 0; i < 3; i++) {
		await transactItemsFromBank({ userID: OWNER_ID, itemsToRemove: currentBank });
		await transactItemsFromBank({ userID: OWNER_ID, itemsToAdd: currentBank });
		await assertBankMatches();
		await user.removeItemsFromBank(currentBank);
		await assertGP(currentGP);
		await user.addItemsToBank({ items: currentBank });
		await assertGP(currentGP);
		await user.removeItemsFromBank(currentBank);
		await user.addItemsToBank({ items: currentBank });
		await assertBankMatches();

		await assertGP(currentGP);
		await transactItemsFromBank({ userID: OWNER_ID, itemsToRemove: gpBank });
		await assertGP(0);
		await transactItemsFromBank({ userID: OWNER_ID, itemsToAdd: gpBank });
		await assertBankMatches();
		await assertGP(currentGP);

		const everything = currentBank.clone().add(gpBank);

		await transactItemsFromBank({ userID: OWNER_ID, itemsToRemove: everything, itemsToAdd: everything });
		await assertBankMatches();
	}

	await assertBankMatches();
	await assertGP(currentGP);

	return 'Success';
}
