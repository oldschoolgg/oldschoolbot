import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { allPetsCL, customPetsCL, discontinuedCustomPetsCL } from '../../lib/data/CollectionsExport';
import { requiresMinion } from '../../lib/minions/decorators';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { removeItemFromBank } from '../../lib/util';

export const allPetIDs = [...allPetsCL, ...customPetsCL, ...discontinuedCustomPetsCL];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '(item:...item)',
			aliases: ['ep'],
			description: 'Equips a pet, like dropping it on the floor ingame.',
			examples: ['+equippet smolcano', '+ep smolcano'],
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [itemArray]: [Item[]]): Promise<KlasaMessage> {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const petItem = itemArray.find(i => userBank[i.id] && allPetIDs.includes(i.id));
		if (!petItem) {
			return msg.channel.send("That's not a pet, or you do not own this pet.");
		}

		const currentlyEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
		if (currentlyEquippedPet) {
			await this.client.commands.get('unequippet')?.run(msg, []);
		}

		const doubleCheckEquippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
		if (doubleCheckEquippedPet) {
			msg.author.log(`Aborting pet equip so we don't clobber ${doubleCheckEquippedPet}`);
			return msg.channel.send('You still have a pet equipped, cancelling.');
		}
		await msg.author.settings.update([
			[UserSettings.Minion.EquippedPet, petItem.id],
			[UserSettings.Bank, removeItemFromBank(msg.author.settings.get(UserSettings.Bank), petItem.id)]
		]);

		msg.author.log(`equipping ${petItem.name}[${petItem.id}]`);

		return msg.channel.send(`${msg.author.minionName} has equipped a ${petItem.name}!`);
	}
}
