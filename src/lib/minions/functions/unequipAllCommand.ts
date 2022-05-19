import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';
import { defaultGear, GearSetupType, GearSetupTypes } from '../../gear';
import { toTitleCase } from '../../util';

export async function unEquipAllCommand(user: KlasaUser, gearType: GearSetupType | undefined): Promise<string> {
	if (!gearType || !GearSetupTypes.includes(gearType)) {
		return `That's not a valid setup, the valid setups are: ${GearSetupTypes.join(', ')}.`;
	}
	if (user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}
	const currentEquippedGear = user.getGear(gearType);

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
