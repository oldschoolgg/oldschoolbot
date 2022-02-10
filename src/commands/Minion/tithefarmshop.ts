import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import TitheFarmBuyables from '../../lib/data/buyables/titheFarmBuyables';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { multiplyBank, stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,250000}] <name:...string>',
			usageDelim: ' ',
			altProtection: true,
			aliases: ['tfs', 'tfshop'],
			description: "Allows a player to purchase farmer's items from the tithefarm shop.",
			examples: ['+tfs farmers hat', '+tithefarmshop farmers jacket'],
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity = 1, buyableName]: [number, string]) {
		const buyable = TitheFarmBuyables.find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			throw `I don't recognize that item, the items you can buy are: ${TitheFarmBuyables.map(
				item => item.name
			).join(', ')}.`;
		}

		await msg.author.settings.sync(true);

		const outItems = multiplyBank(buyable.outputItems, quantity);
		const itemString = new Bank(outItems).toString();

		const titheFarmPoints = msg.author.settings.get(UserSettings.Stats.TitheFarmPoints);

		const titheFarmPointsCost = buyable.titheFarmPoints * quantity;

		if (titheFarmPoints < titheFarmPointsCost) {
			throw `You need ${titheFarmPointsCost} Tithe Farm points to make this purchase.`;
		}

		let purchaseMsg = `${itemString} for ${titheFarmPointsCost} Tithe Farm points`;

		await msg.confirm(`${msg.author}, please confirm that you want to purchase ${purchaseMsg}.`);

		await msg.author.settings.update(UserSettings.Stats.TitheFarmPoints, titheFarmPoints - titheFarmPointsCost);

		await msg.author.addItemsToBank({ items: outItems, collectionLog: true });

		return msg.channel.send(`You purchased ${itemString} for ${titheFarmPointsCost} Tithe Farm points.`);
	}
}
