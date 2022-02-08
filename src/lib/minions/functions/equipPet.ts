import { KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { allPetIDs } from '../../data/CollectionsExport';
import { UserSettings } from '../../settings/types/UserSettings';
import getOSItem from '../../util/getOSItem';
import { unequipPet } from './unequipPet';

export async function equipPet(msg: KlasaMessage, itemName: string) {
	const petItem = getOSItem(itemName);
	const cost = new Bank().add(petItem.id);

	if (!allPetIDs.includes(petItem.id) || !msg.author.owns(cost)) {
		return msg.channel.send("That's not a pet, or you do not own this pet.");
	}

	const currentlyEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
	if (currentlyEquippedPet) {
		await unequipPet(msg);
	}

	const doubleCheckEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
	if (doubleCheckEquippedPet) {
		msg.author.log(`Aborting pet equip so we don't clobber ${doubleCheckEquippedPet}`);
		return msg.channel.send('You still have a pet equipped, cancelling.');
	}

	await msg.author.settings.update(UserSettings.Minion.EquippedPet, petItem.id);
	await msg.author.removeItemsFromBank(cost);

	msg.author.log(`equipping ${petItem.name}[${petItem.id}]`);

	return msg.channel.send(
		`${msg.author.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`
	);
}
