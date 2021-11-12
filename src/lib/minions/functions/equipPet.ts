import { noOp } from 'e';
import { KlasaClient, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import MinionCommand from '../../../commands/Minion/minion';
import { allPetIDs } from '../../data/CollectionsExport';
import { UserSettings } from '../../settings/types/UserSettings';
import getOSItem from '../../util/getOSItem';

export async function equipPet(msg: KlasaMessage, itemName: string) {
	const petItem = getOSItem(itemName);
	const cost = new Bank().add(petItem.id);

	if (!allPetIDs.includes(petItem.id) || !msg.author.owns(cost)) {
		return msg.channel.send("That's not a pet, or you do not own this pet.");
	}

	const currentlyEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
	if (currentlyEquippedPet) {
		const client = msg.client as KlasaClient;
		await (client.commands.get('m') as any as MinionCommand)!.unequippet(msg).catch(noOp);
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
