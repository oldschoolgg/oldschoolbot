import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { Bank } from 'oldschooljs';

import type { GearSetupType } from '../../gear/types';
import { GearSetupTypes } from '../../gear/types';
import { defaultGear } from '../../structures/Gear';

export async function unEquipAllCommand(
	userID: string,
	gearType: GearSetupType | undefined,
	bypassBusy?: boolean
): Promise<string> {
	if (!gearType || !GearSetupTypes.includes(gearType)) {
		return `That's not a valid setup, the valid setups are: ${GearSetupTypes.join(', ')}.`;
	}
	const user = await mUserFetch(userID);
	if (!bypassBusy && user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}
	const currentEquippedGear = user.gear[gearType];

	const refund = new Bank();
	for (const val of Object.values(currentEquippedGear.raw())) {
		if (!val) continue;
		refund.add(val.item, val.quantity);
	}
	if (refund.length === 0) {
		return `You have no items in your ${toTitleCase(gearType)} setup.`;
	}

	await user.update({
		[`gear_${gearType}`]: defaultGear
	});

	await user.addItemsToBank({ items: refund, collectionLog: false });
	return `You unequipped all items (${refund}) from your ${toTitleCase(gearType)} setup.`;
}
