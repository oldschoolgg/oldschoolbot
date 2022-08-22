import { Bank } from 'oldschooljs';

import { mahojiUserSettingsUpdate, mUserFetch } from '../../../mahoji/mahojiSettings';
import { defaultGear, GearSetupType, GearSetupTypes } from '../../gear';
import { toTitleCase } from '../../util';

export async function unEquipAllCommand(userID: string, gearType: GearSetupType | undefined): Promise<string> {
	if (!gearType || !GearSetupTypes.includes(gearType)) {
		return `That's not a valid setup, the valid setups are: ${GearSetupTypes.join(', ')}.`;
	}
	const user = await mUserFetch(userID);
	if (user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}
	const currentEquippedGear = user.gear[gearType];

	let refund = new Bank();
	for (const val of Object.values(currentEquippedGear.raw())) {
		if (!val) continue;
		refund.add(val.item, val.quantity);
	}
	if (refund.length === 0) {
		return `You have no items in your ${toTitleCase(gearType)} setup.`;
	}

	await mahojiUserSettingsUpdate(user.id, {
		[`gear_${gearType}`]: defaultGear
	});

	await user.addItemsToBank({ items: refund, collectionLog: false });
	return `You unequipped all items (${refund}) from your ${toTitleCase(gearType)} setup.`;
}
