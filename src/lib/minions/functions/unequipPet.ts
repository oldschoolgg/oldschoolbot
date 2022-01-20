import { KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../settings/types/UserSettings';
import { itemNameFromID } from '../../util';

export async function unequipPet(msg: KlasaMessage) {
	const equippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
	if (!equippedPet) return msg.channel.send("You don't have a pet equipped.");

	msg.author.log(`unequipping ${itemNameFromID(equippedPet)}[${equippedPet}]`);

	const loot = new Bank().add(equippedPet);

	await msg.author.settings.update(UserSettings.Minion.EquippedPet, null);
	await msg.author.addItemsToBank({ items: loot, collectionLog: false });

	return msg.channel.send(
		`${msg.author.minionName} picks up their ${itemNameFromID(equippedPet)} pet and places it back in their bank.`
	);
}
