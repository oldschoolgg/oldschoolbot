import { Bank } from 'oldschooljs';

import { OWNER_ID } from '../config';
import { removeItemsFromBank, transactItemsFromBank } from '../mahoji/mahojiSettings';
import { UserSettings } from './settings/types/UserSettings';
import { assert } from './util';

export async function stressTest() {
	const user = await globalClient.fetchUser(OWNER_ID);
	const currentBalance = user.settings.get(UserSettings.GP);
	const currentTbow = user.bank().amount('Twisted bow');
	console.log(`Starting with ${currentBalance}-GP ${currentTbow}-TBOw`);

	const b = new Bank().add('Coins', 1).add('Twisted bow').freeze();
	for (let i = 0; i < 3; i++) {
		await user.addItemsToBank({ items: b });
		await user.removeItemsFromBank(b);

		await transactItemsFromBank({ userID: OWNER_ID, itemsToAdd: b });
		await transactItemsFromBank({ userID: OWNER_ID, itemsToRemove: b });

		const { newUser } = await transactItemsFromBank({ userID: OWNER_ID, itemsToAdd: b, itemsToRemove: b });
		assert(Number(newUser.GP) + 1 === currentBalance, `${Number(newUser.GP) + 1} should equal ${currentBalance}`);
		const res = await removeItemsFromBank(OWNER_ID, b);
		assert(Number(res!.newUser.GP) === currentBalance, `${res!.newUser.GP} should equal ${currentBalance}`);
	}
	const newBal = user.settings.get(UserSettings.GP);
	const newTbow = user.bank().amount('Twisted bow');

	console.log(`Starting with ${currentBalance}-GP ${currentTbow}-TBOw`);

	return `Bank/GP: ${currentBalance === newBal && currentTbow === newTbow ? 'OK' : 'FAIL'}`;
}
