import { Bank } from 'oldschooljs';

import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { mahojiUserSettingsUpdate } from '../MUser';
import { ItemBank } from '../types';
import { validateItemBankAndThrow } from '../util';

export async function updateLegacyUserBankSetting(userID: string, key: 'tob_cost' | 'tob_loot', bankToAdd: Bank) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${key}`);
	const currentUserSettings = await mahojiUsersSettingsFetch(userID, {
		[key]: true
	});
	const current = currentUserSettings[key] as ItemBank;
	validateItemBankAndThrow(current);
	const newBank = new Bank().add(current).add(bankToAdd);

	const res = await mahojiUserSettingsUpdate(userID, {
		[key]: newBank.bank
	});
	return res;
}
