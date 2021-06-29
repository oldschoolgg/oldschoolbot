import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { NestBoxes } from '../../lib/data/openables';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

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
			return msg.channel.send(
				`I don't exchange that item. I exchange the following: ${MolePartItems.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		if (!quantity) {
			quantity = 1;
		}

		await msg.author.settings.sync(true);

		if (msg.author.numItemsInBankSync(moleItem.inputItem) < quantity) {
			return msg.channel.send(`You don't have enough ${moleItem.name} to exchange!`);
		}

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(NestBoxes.roll());
		}
		// Remove mole parts and give loot
		await msg.author.exchangeItemsFromBank({
			costBank: { [moleItem.inputItem]: quantity },
			lootBank: loot,
			collectionLog: true
		});

		return msg.channel.send(`You exchanged ${quantity}x ${moleItem.name} and received: ${loot}.`);
	}
}
