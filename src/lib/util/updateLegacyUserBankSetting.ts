import { Bank } from 'oldschooljs';

import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { mahojiUserSettingsUpdate } from '../MUser';
import { ItemBank } from '../types';

export async function updateLegacyUserBankSetting(
	userID: string,
	key: 'tob_cost' | 'tob_loot' | 'lottery_input',
	bankToAdd: Bank
) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${key}`);
	const currentUserSettings = await mahojiUsersSettingsFetch(userID, {
		[key]: true
	});
	const current = currentUserSettings[key] as ItemBank;
	const newBank = new Bank(current).add(bankToAdd);

	const res = await mahojiUserSettingsUpdate(userID, {
		[key]: newBank.bank
	});
	return res;
}
