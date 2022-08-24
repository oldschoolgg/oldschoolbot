import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';

export function brewRestoreSupplyCalc(
	user: KlasaUser,
	brewsNeeded: number,
	restoresNeeded?: number
): { foodBank: Bank; foodReason: string; hasEnough: boolean } {
	const userItems = user.bank();
	const itemBank = new Bank();

	const dontUseEnhanced = !user.settings.get(UserSettings.BitField).includes(BitField.UseEnhancedBrewsRestores);
	let totalBrews = 0;
	const enhancedBrews = dontUseEnhanced ? 0 : userItems.amount('Enhanced saradomin brew');
	const brews = userItems.amount('Saradomin brew(4)');

	totalBrews += enhancedBrews * 2;
	if (totalBrews >= brewsNeeded) {
		itemBank.add('Enhanced saradomin brew', Math.ceil(brewsNeeded / 2));
	} else {
		itemBank.add('Enhanced saradomin brew', enhancedBrews);
		totalBrews += brews;
		if (totalBrews >= brewsNeeded) {
			itemBank.add('Saradomin brew (4)', brewsNeeded - enhancedBrews * 2);
		} else {
			return {
				hasEnough: false,
				foodBank: itemBank,
				foodReason: `${user.username} does not have enough Saradomin brews. ${enhancedBrews} enhanced & ${brews} normal found, ${brewsNeeded} required (enhanced count for 2).`
			};
		}
	}

	if (!restoresNeeded) restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));
	let totalRestores = 0;
	const enhancedRestores = dontUseEnhanced ? 0 : userItems.amount('Enhanced super restore');
	const restores = userItems.amount('Super restore(4)');

	totalRestores += enhancedRestores * 2;
	if (totalRestores >= restoresNeeded) itemBank.add('Enhanced super restore', Math.ceil(restoresNeeded / 2));
	else {
		itemBank.add('Enhanced super restore', enhancedRestores);
		totalRestores += restores;
		if (totalRestores >= restoresNeeded) {
			itemBank.add('Super restore (4)', restoresNeeded - enhancedRestores * 2);
		} else {
			return {
				hasEnough: false,
				foodBank: itemBank,
				foodReason: `${user.username} does not have enough Super restores. ${enhancedRestores} enhanced & ${restores} normal found, ${restoresNeeded} required (enhanced count for 2).`
			};
		}
	}

	return {
		hasEnough: true,
		foodBank: itemBank,
		foodReason: ''
	};
}
