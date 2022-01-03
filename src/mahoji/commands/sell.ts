import { ApplicationCommandOptionType, CommandRunOptions, ICommand } from 'mahoji';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { toKMB, updateBankSetting, updateGPTrackSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';

export const command: ICommand = {
	name: 'sell',
	description: 'Sell an item from your bank',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'The items you want to sell',
			required: true
		}
	],
	run: async ({ member, options }: CommandRunOptions<{ items: string }>) => {
		const user = await client.fetchUser(member.user.id);
		if (user.isIronman) return "Iron players can't sell items.";

		const bankToSell = parseBank({
			inputBank: user.bank(),
			inputStr: options.items
		});

		let totalPrice = 0;
		const customPrices = client.settings.get(ClientSettings.CustomPrices);
		for (const [item, qty] of bankToSell.items()) {
			const price = customPrices[item.id] ?? item.price;
			totalPrice += price * qty;
		}
		totalPrice = Math.floor(totalPrice * 0.8);
		const tax = Math.ceil((totalPrice / 0.8) * 0.2);

		await Promise.all([user.removeItemsFromBank(bankToSell.bank), user.addGP(totalPrice)]);

		updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		return `Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(totalPrice)})**. Tax: ${toKMB(tax)}`;
	}
};
