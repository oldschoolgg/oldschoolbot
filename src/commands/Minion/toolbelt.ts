import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemID, addBanks, bankHasItem, addItemToBank, removeItemFromBank } from '../../lib/util';
import { generateToolbeltImage } from '../../lib/gear/functions/generateToolbeltImage';
import { MessageAttachment } from 'discord.js';
import { Items } from 'oldschooljs';

const defaultItems = {
	[itemID('Butterfly net')]: 1,
	[itemID('Harpoon')]: 1,
	[itemID('Watering can(8)')]: 1,
	[itemID('Secateurs')]: 1,
	[itemID('Saw')]: 1,
	[itemID('Bronze axe')]: 1,
	[itemID('Bronze pickaxe')]: 1
};

const itemsYouCanAdd = [
	'3rd age pickaxe',
	'Crystal pickaxe',
	'Infernal pickaxe',
	'Dragon pickaxe',
	'3rd age axe',
	'Crystal axe',
	'Infernal axe',
	'Dragon axe',
	'Crystal saw',
	'Magic secateurs',
	"Gricoller's can",
	'Crystal harpoon',
	'Dragon harpoon',
	'Magic butterfly net'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[itemname:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [itemname]: [string]) {
		let toolbelt = msg.author.settings.get(UserSettings.Toolbelt);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (Object.keys(toolbelt).length < 1) {
			await msg.author.settings.update(
				UserSettings.Toolbelt,
				addBanks([toolbelt, defaultItems])
			);
			toolbelt = defaultItems;
		}

		if (typeof itemname === 'undefined') {
			const image = await generateToolbeltImage(this.client, toolbelt);
			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		if (!itemsYouCanAdd.some(x => x.toLocaleLowerCase() === itemname.toLocaleLowerCase()))
			throw `Thats not a item to add to your toolbelt. Valid items are ${itemsYouCanAdd
				.map(x => x)
				.join(', ')}.`;

		if (msg.flagArgs.remove) {
			if (!bankHasItem(toolbelt, itemID(itemname)))
				throw `You don't have 1x ${itemname} in your toolbelt.`;
			await msg.author.settings.update(
				UserSettings.Bank,
				addItemToBank(userBank, itemID(itemname))
			);
			await msg.author.settings.update(
				UserSettings.Toolbelt,
				removeItemFromBank(userBank, itemID(itemname))
			);
			return msg.send(`You've unequipped 1x ${itemname} from your toolbelt.`);
		}

		const item = Items.get(itemname);
		if (!bankHasItem(userBank, item!.id)) throw `You don't have 1x ${itemname}`;

		if (Object.keys(toolbelt).some(x => parseInt(x) === itemID(itemname)))
			throw `You already have 1x ${itemname} equipped in your toolbelt.`;

		await msg.author.removeItemFromBank(item!.id, 1);
		const addItem = { [item!.id]: 1 };
		await msg.author.settings.update(UserSettings.Toolbelt, addBanks([toolbelt, addItem]));
		return msg.send(`Added 1x ${itemname} to your toolbelt.`);
	}
}
