import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { pets } from '../../lib/collectionLog';
import { requiresMinion } from '../../lib/minions/decorators';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { removeItemFromBank } from '../../lib/util';
import resolveItems from '../../lib/util/resolveItems';

const allPetIDs = [
	...resolveItems([
		'Doug',
		'Zippy',
		'Shelldon',
		'Remy',
		'Lil Lamb',
		'Harry',
		'Klik',
		'Wintertoad',
		'Scruffy',
		'Zak',
		'Hammy',
		'Skipper',
		'Ori',
		'Cob',
		'Takon'
	]),
	Object.values(pets)
].flat(Infinity);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '(item:...item)'
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [itemArray]: [Item[]]): Promise<KlasaMessage> {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const petItem = itemArray.find(i => userBank[i.id] && allPetIDs.includes(i.id));
		if (!petItem) {
			return msg.send(`That's not a pet, or you do not own this pet.`);
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

		return msg.send(`${msg.author.minionName} has equipped a ${petItem.name}!`);
	}
}
