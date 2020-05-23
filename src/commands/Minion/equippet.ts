import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { requiresMinion } from '../../lib/minions/decorators';
import { pets } from '../../lib/collectionLog';
import { removeItemFromBank } from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';

const allPetIDs = Object.values(pets).flat(Infinity);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<itemName:string>'
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage> {
		const petItem = getOSItem(itemName);
		if (!allPetIDs.includes(petItem.id)) {
			throw `That's not a pet.`;
		}

		const hasThisItem = await msg.author.hasItem(petItem.id);
		if (!hasThisItem) {
			throw `You don't have this pet in your bank! Sad.`;
		}

		const currentlyEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
		if (currentlyEquippedPet) {
			await this.client.commands.get('unequippet')?.run(msg, []);
		}

		await msg.author.settings.update([
			[UserSettings.Minion.EquippedPet, petItem.id],
			[
				UserSettings.Bank,
				removeItemFromBank(msg.author.settings.get(UserSettings.Bank), petItem.id)
			]
		]);

		msg.author.log(`equipping ${petItem.name}[${petItem.id}]`);

		return msg.send(
			`${msg.author.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`
		);
	}
}
