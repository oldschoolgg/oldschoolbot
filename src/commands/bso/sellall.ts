import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import getOSItem from '../../lib/util/getOSItem';
import { addBanks, removeBankFromBank } from 'oldschooljs/dist/util';
import { Util } from 'oldschooljs';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import resolveItems from '../../lib/util/resolveItems';
import { filterableTypes } from '../../lib/filterables';
import { allPetIDs } from '../Minion/equippet';

export default class extends BotCommand {
	public avoidItems = [
		resolveItems([
			'Tradeable mystery box',
			'Untradeable mystery box',
			'Holiday mystery box',
			'Pet mystery box'
		]),
		Object.values(allPetIDs),
		Object.values(filterableTypes.find(f => f.name === 'Clues and Caskets')?.items ?? [])
	].flat(Infinity) as number[];

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		let userBank = msg.author.settings.get(UserSettings.Bank);
		let toSell: ItemBank = {};
		let toSellQty = 0;
		let toDropQty = 0;
		let valueSell = 0;
		let toDrop: ItemBank = {};
		for (const i of Object.entries(userBank)) {
			const _item = getOSItem(i[0]);
			if (this.avoidItems.includes(_item.id)) continue;
			if (_item.tradeable_on_ge) {
				valueSell += (await this.client.fetchItemPrice(i[0])) * i[1];
				toSell = addBanks([{ [i[0]]: i[1] }, toSell]);
				toSellQty += i[1];
			} else if (msg.flagArgs.untradeables) {
				toDrop = addBanks([{ [i[0]]: i[1] }, toDrop]);
				toDropQty += i[1];
			}
		}
		const realSellValue = valueSell * (msg.flagArgs.sacrifice ? 1 : 0.75);
		const dividedAmount = (valueSell * 0.25) / 1_000_000;
		if (
			msg.flagArgs.untradeables &&
			Object.entries(toDrop).length === 0 &&
			Object.entries(toSell).length === 0
		)
			return msg.send(
				`You don't have anything to ${
					msg.flagArgs.sacrifice ? 'sacrifice' : 'sell'
				} or to drop.`
			);
		else if (!msg.flagArgs.untradeables && Object.entries(toSell).length === 0)
			return msg.send(
				`You don't have anything to ${msg.flagArgs.sacrifice ? 'sacrifice' : 'sell'}.`
			);

		let message;
		if (Object.entries(toSell).length !== 0 && Object.entries(toDrop).length === 0) {
			message = `${msg.author}, say \`confirm\` to ${
				msg.flagArgs.sacrifice ? 'sacrifice' : 'sell'
			} ${toSellQty.toLocaleString()} items from your bank, valued at ${realSellValue.toLocaleString()}gp (${Util.toKMB(
				realSellValue
			)})`;
		} else if (Object.entries(toSell).length === 0 && Object.entries(toDrop).length !== 0) {
			message = `${
				msg.author
			}, say \`confirm\` to drop ${toDropQty.toLocaleString()} untradeable items from your bank.`;
		} else {
			message = `${msg.author}, say \`confirm\` to ${
				msg.flagArgs.sacrifice ? 'sacrifice' : 'sell'
			} ${toSellQty.toLocaleString()} items from your bank, valued at ${realSellValue.toLocaleString()}gp (${Util.toKMB(
				realSellValue
			)})${
				msg.flagArgs.untradeables
					? `, also, dropping ${toDropQty.toLocaleString()} items that can not be ${
							msg.flagArgs.sacrifice ? 'sacrificed' : 'sold'
					  }?`
					: ''
			}`;
		}
		const sellMsg = await msg.channel.send(message);
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: 10000,
					errors: ['time']
				}
			);
		} catch (err) {
			return sellMsg.edit(
				`Cancelling bank ${msg.flagArgs.sacrifice ? 'sacrifice' : 'sale'}.`
			);
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			(userBank = addBanks([removeBankFromBank(userBank, toSell)]))
		);
		if (msg.flagArgs.sacrifice) {
			await this.client.settings.update(
				ClientSettings.EconomyStats.SacrificedBank,
				addBanks([
					toSell,
					this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank)
				])
			);
			await msg.author.settings.update(
				UserSettings.SacrificedValue,
				msg.author.settings.get(UserSettings.SacrificedValue) + valueSell
			);
		} else {
			await msg.author.settings.update(
				UserSettings.GP,
				msg.author.settings.get(UserSettings.GP) + realSellValue
			);
			await this.client.settings.update(
				ClientSettings.EconomyStats.ItemSellTaxBank,
				Math.floor(dividedAmount + Math.round(dividedAmount * 100) / 100)
			);
		}
		if (msg.flagArgs.untradeables) {
			await msg.author.settings.update(
				UserSettings.Bank,
				addBanks([removeBankFromBank(userBank, toDrop)])
			);
		}
		return msg.send(`Bank ${msg.flagArgs.sacrifice ? 'sacrifice' : 'sale'} complete!`);
	}
}
