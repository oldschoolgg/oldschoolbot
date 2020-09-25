import { KlasaUser } from 'klasa';
import { removeBankFromBank } from 'oldschooljs/dist/util';

import { Bank, ItemBank } from '../../types';

export default async function addItemsToBankAndReturn(user: KlasaUser, loot: ItemBank) {
	const addResult = Object.values(await user.addItemsToBank(loot, true));
	const bankPrevious = addResult[0].previous as Bank;
	const bankAfter = addResult[0].next as Bank;
	return removeBankFromBank(bankAfter, bankPrevious);
}
