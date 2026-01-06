import { defaultGearSetup, type GearSetupType, GearSetupTypes } from '@oldschoolgg/gear';
import { toTitleCase } from '@oldschoolgg/toolkit';

import { isValidGearSetup } from '@/lib/gear/functions/isValidGearSetup.js';

export async function unEquipAllCommand(user: MUser, gearType: GearSetupType, bypassBusy?: boolean): CommandResponse {
	if (!isValidGearSetup(gearType)) {
		return `That's not a valid setup, the valid setups are: ${GearSetupTypes.join(', ')}.`;
	}
	if (!bypassBusy && (await user.minionIsBusy())) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}

	return user.update((_user: MUser) => {
		const currentEquippedGear = _user.gear[gearType];
		const refund = currentEquippedGear.toBank();

		if (refund.length === 0) {
			return { response: `You have no items in your ${toTitleCase(gearType)} setup.` };
		}

		return {
			itemsToAdd: refund,
			collectionLog: false,
			otherUpdates: {
				[`gear_${gearType}`]: defaultGearSetup
			},
			response: `You have unequipped all items from your ${toTitleCase(gearType)} setup.`
		};
	});
}
