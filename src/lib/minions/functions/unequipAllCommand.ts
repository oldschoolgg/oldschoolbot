import { KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { defaultGear, GearSetupType, GearSetupTypes, resolveGearTypeSetting } from '../../gear';
import { toTitleCase } from '../../util';

export async function unEquipAllCommand(msg: KlasaMessage, gearType: GearSetupType | undefined) {
	if (!gearType || !GearSetupTypes.includes(gearType)) {
		return msg.channel.send(`That's not a valid setup, the valid setups are: ${GearSetupTypes.join(', ')}.`);
	}
	if (msg.author.minionIsBusy) {
		return msg.channel.send(`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`);
	}
	const gearTypeSetting = resolveGearTypeSetting(gearType);
	const currentEquippedGear = msg.author.getGear(gearType);

	let refund = new Bank();
	for (const val of Object.values(currentEquippedGear.raw())) {
		if (!val) continue;
		refund.add(val.item, val.quantity);
	}
	if (refund.length === 0) {
		return msg.channel.send(`You have no items in your ${toTitleCase(gearType)} setup.`);
	}

	await msg.author.settings.update(gearTypeSetting, defaultGear);

	await msg.author.addItemsToBank({ items: refund, collectionLog: false });
	return msg.channel.send(`You unequipped all items (${refund}) from your ${toTitleCase(gearType)} setup.`);
}
