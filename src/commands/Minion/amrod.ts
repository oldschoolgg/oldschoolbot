import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import itemID from '../../lib/util/itemID';

const amrodTradeableList = [
	{
		name: 'Crystal weapon seed',
		alias: ['cws'],
		require: itemID('Crystal weapon seed'),
		output: 10
	},
	{
		name: 'Crystal tool seed',
		alias: ['cts'],
		require: itemID('Crystal tool seed'),
		output: 100
	},
	{
		name: 'Enhanced crystal teleport seed',
		alias: ['ects'],
		require: itemID('Enhanced crystal teleport seed'),
		output: 150
	},
	{
		name: 'Crystal armour seed',
		alias: ['cas'],
		require: itemID('Crystal armour seed'),
		output: 250
	},
	{
		name: 'Enhanced crystal weapon seed',
		alias: ['ecws'],
		require: itemID('Enhanced crystal weapon seed'),
		output: 1500
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,250000}] <name:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to exchange certain crystal items with Amrod for crystal shards.',
			examples: ['+amrod enhanced crystal teleport seed', '+amrod 15 crystal tool seed']
		});
	}

	async run(msg: KlasaMessage, [quantity = 1, itemName]: [number, string]) {
		await msg.author.settings.sync(true);
		const amrodTrade = amrodTradeableList.find(
			a => stringMatches(itemName, a.name) || a.alias.some(al => stringMatches(al, itemName))
		);
		if (!amrodTrade) {
			return msg.channel.send(
				`This is not a valid item. Valid items that can be traded are: ${amrodTradeableList
					.map(a => `${a.name} (${a.alias})`)
					.join(', ')}`
			);
		}
		const toTradeBank = new Bank().add(amrodTrade.require, quantity);
		if (!msg.author.bank().has(toTradeBank.bank)) {
			return msg.channel.send(`You do not have **${toTradeBank}** to trade. Plese, come back when you do.`);
		}

		const toReceiveBank = new Bank().add('Crystal shard', amrodTrade.output * quantity);

		await msg.confirm(`Do you want to trade **${toTradeBank}** for **${toReceiveBank}**?`);

		await msg.author.removeItemsFromBank(toTradeBank);
		await msg.author.addItemsToBank(toReceiveBank);

		return msg.channel.send(`You traded **${toTradeBank}** for **${toReceiveBank}**.`);
	}
}
