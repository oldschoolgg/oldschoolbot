import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { stringMatches } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { NestBoxes } from './../../lib/openables';

interface MolePartItem {
	name: string;
	inputItem: number;
	aliases?: string[];
}

const MolePartItems: MolePartItem[] = [
	{
		name: 'Mole skin',
		inputItem: itemID('Mole skin'),
		aliases: ['skin']
	},
	{
		name: 'Mole claw',
		inputItem: itemID('Mole claw'),
		aliases: ['claw']
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1}] <itemName:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			description: 'Allows you to exchange mole parts for Nest boxes.',
			examples: ['+wyson mole skin', '+wyson 100 mole claw'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		itemName = itemName.toLowerCase();

		const moleItem = MolePartItems.find(
			item =>
				stringMatches(itemName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, itemName)))
		);

		if (!moleItem) {
			return msg.send(
				`I don't exchange that item. I exchange the following: ${MolePartItems.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		if (!quantity) {
			quantity = 1;
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const exchangeMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to exchange ${quantity}x **${moleItem.name}** for equal amount of random Nest boxes.`
			);

			// Confirm the user wants to exchange the item(s)
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return exchangeMsg.edit(`Cancelling mole part exchange.`);
			}
		}

		await msg.author.settings.sync(true);

		if (msg.author.numItemsInBankSync(moleItem.inputItem) < quantity) {
			return msg.send(`You don't have enough ${moleItem.name} to exchange!`);
		}

		await msg.author.removeItemFromBank(moleItem.inputItem, quantity);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(NestBoxes.roll());
		}

		await msg.author.addItemsToBank(loot.values(), true);

		return msg.send(
			`You exchanged ${quantity}x ${
				moleItem.name
			} and received: ${await createReadableItemListFromBank(this.client, loot.bank)}.`
		);
	}
}
