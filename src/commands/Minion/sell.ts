import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateBankSetting, updateGPTrackSetting } from '../../lib/util';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<items:TradeableBank>',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot for 80% of G.E price.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [[bankToSell, totalPrice]]: [[Bank, number]]) {
		if (msg.author.isIronman) return msg.channel.send("Iron players can't sell items.");
		totalPrice = Math.floor(totalPrice * 0.8);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${Util.toKMB(
					totalPrice
				)}).`
			);

			try {
				await msg.channel.awaitMessages({
					...options,
					filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
				});
			} catch (err) {
				return sellMsg.edit('Cancelling sale.');
			}
		}

		const tax = Math.ceil((totalPrice / 0.8) * 0.2);

		await Promise.all([msg.author.removeItemsFromBank(bankToSell.bank), msg.author.addGP(totalPrice)]);

		updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		msg.author.log(`sold ${JSON.stringify(bankToSell.bank)} for ${totalPrice}`);

		return msg.channel.send(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${Util.toKMB(totalPrice)})**. Tax: ${Util.toKMB(
				tax
			)}`
		);
	}
}
