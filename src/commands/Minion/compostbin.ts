import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { bankHasItem, stringMatches } from '../../lib/util';

const SuperCompostables = [
	'Pineapple',
	'Watermelon',
	'Coconut',
	'Coconut shell',
	'Papaya fruit',
	'Mushroom',
	'Poison ivy berries',
	'Jangerberries',
	'White berries',
	'Snape grass',
	'Toadflax',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Lantadyme',
	'Dwarf weed',
	'Torstol',
	'Oak roots',
	'Willow roots',
	'Maple roots',
	'Yew roots',
	'Magic roots',
	'Celastrus bark',
	'Calquat fruit',
	'White tree fruit',
	'White lily'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}|cropToCompost:...string] [cropToCompost:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Composts crops into supercompost.',
			examples: ['+compostbin watermelon']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [quantity, cropToCompost]: [null | number | string, string]) {
		await msg.author.settings.sync(true);

		if (typeof quantity === 'string') {
			cropToCompost = quantity;
			quantity = null;
		}

		if (!cropToCompost) {
			return msg.channel.send(
				`You need to select a crop to compost. The crops you can compost are: ${SuperCompostables.join(', ')}.`
			);
		}

		const superCompostableCrop = SuperCompostables.find(crop => stringMatches(crop, cropToCompost));

		if (!superCompostableCrop) {
			return msg.channel.send(
				`That's not a valid crop to compost. The crops you can compost are: ${SuperCompostables.join(', ')}.`
			);
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (quantity === null) {
			quantity = msg.author.numItemsInBankSync(itemID(superCompostableCrop));
		} else if (!bankHasItem(userBank, itemID(superCompostableCrop), quantity)) {
			return msg.channel.send(
				`You do not have enough ${superCompostableCrop} to compost for the quantity specified`
			);
		}

		if (quantity === 0) {
			return msg.channel.send(`You have no ${superCompostableCrop} to compost!`);
		}

		await msg.confirm(
			`${msg.author}, please confirm that you want to compost ${quantity}x ${cropToCompost} into supercompost.`
		);

		const costBank = new Bank().add(superCompostableCrop, quantity);
		const lootBank = new Bank().add('Supercompost', quantity);

		await msg.author.exchangeItemsFromBank({ costBank, lootBank, collectionLog: true });

		return msg.channel.send(
			`You've composted ${quantity}x ${superCompostableCrop} and received ${quantity}x Supercompost in return.`
		);
	}
}
