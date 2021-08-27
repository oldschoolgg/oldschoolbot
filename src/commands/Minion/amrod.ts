import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';

const amrodTradeableList = [
	{
		require: itemID('Crystal weapon seed'),
		output: 10
	},
	{
		require: itemID('Crystal tool seed'),
		output: 100
	},
	{
		require: itemID('Enhanced crystal teleport seed'),
		output: 150
	},
	{
		require: itemID('Crystal armour seed'),
		output: 250
	},
	{
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
		const toTradeItem = getOSItem(itemName);
		const amrodTrade = amrodTradeableList.find(a => a.require === toTradeItem?.id);
		if (!toTradeItem || !amrodTrade) {
			return msg.channel.send(
				`This is not a valid item. Valid items that can be traded are: ${amrodTradeableList
					.map(a => getOSItem(a.require).name)
					.join(', ')}`
			);
		}
		const toTradeBank = new Bank().add(toTradeItem.id, quantity);
		if (!msg.author.bank().has(toTradeBank.bank)) {
			return msg.channel.send(`You do not have **${toTradeBank}** to trade. Plese, come back when you do.`);
		}

		const toReceiveBank = new Bank().add('Crystal shard', amrodTrade.output * quantity);

		await msg.confirm(
			`Do you want to trade **${quantity.toLocaleString()}x ${toTradeItem.name}** for **${toReceiveBank}**?`
		);

		await msg.author.removeItemsFromBank(toTradeBank);
		await msg.author.addItemsToBank(toReceiveBank);

		return msg.channel.send(`You traded **${toTradeBank}** for **${toReceiveBank}**.`);
	}
}
