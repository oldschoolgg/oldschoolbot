import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export const superCompostables = [
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
			usage: '[quantity:int{1}|cropToCompost:...string] [cropToCompost:...string]',
			usageDelim: ' ',
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
				`You need to select a crop to compost. The crops you can compost are: ${superCompostables.join(', ')}.`
			);
		}

		const superCompostableCrop = superCompostables.find(crop => stringMatches(crop, cropToCompost));

		if (!superCompostableCrop) {
			return msg.channel.send(
				`That's not a valid crop to compost. The crops you can compost are: ${superCompostables.join(', ')}.`
			);
		}

		const userBank = msg.author.bank();

		if (quantity === null) {
			quantity = userBank.amount(superCompostableCrop);
		}

		const cost = new Bank().add(superCompostableCrop, quantity);

		if (!userBank.has(cost)) {
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

		await msg.author.removeItemsFromBank(new Bank().add(superCompostableCrop, quantity));
		await msg.author.addItemsToBank({ items: new Bank().add('Supercompost', quantity) });

		return msg.channel.send(`You've composted ${cost} and received ${quantity}x Supercompost in return.`);
	}
}
