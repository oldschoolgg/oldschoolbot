import { TextChannel } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { toKMB, truncateString, updateBankSetting, updateGPTrackSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import { OSBMahojiCommand } from '../lib/util';
import { filterOption, handleMahojiConfirmation, searchOption } from '../mahojiSettings';

export const sellCommand: OSBMahojiCommand = {
	name: 'sell',
	description: 'Sell an item from your bank',
	attributes: {
		ironCantUse: true,
		oneAtTime: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'The items you want to sell.'
		},
		filterOption,
		searchOption
	],
	run: async ({
		member,
		options,
		interaction,
		channelID,
		userID
	}: CommandRunOptions<{ items?: string; filter?: string; search?: string }>) => {
		const user = await client.fetchUser(member.user.id);
		if (user.isIronman) return "Iron players can't sell items.";

		if (!options.filter && !options.items && !options.search) {
			return 'You need to provide a filter, search or list of items.';
		}

		const bankToSell = parseBank({
			inputBank: user.bank(),
			inputStr: options.items,
			filters: options.filter ? [options.filter] : undefined,
			search: options.search,
			maxSize: 50
		});

		bankToSell.filter(i => Boolean(i.tradeable), true);

		if (bankToSell.length === 0) {
			return 'No valid items to sell were given.';
		}

		let totalPrice = 0;
		const customPrices = client.settings.get(ClientSettings.CustomPrices);
		for (const [item, qty] of bankToSell.items()) {
			const price = customPrices[item.id] ?? item.price;
			totalPrice += price * qty;
		}
		totalPrice = Math.floor(totalPrice * 0.8);
		const tax = Math.ceil((totalPrice / 0.8) * 0.2);

		const sellStr = `**${truncateString(bankToSell.toString(), 1300)}**`;

		await handleMahojiConfirmation(
			client.channels.cache.get(channelID.toString()) as TextChannel,
			userID,
			interaction,
			`Are you sure you want to sell ${sellStr}?`
		);

		await Promise.all([
			user.removeItemsFromBank(bankToSell.bank),
			user.addGP(totalPrice),
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice),
			updateBankSetting(client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank)
		]);

		return `Sold ${sellStr} for **${totalPrice.toLocaleString()}gp (${toKMB(totalPrice)})**. Tax: ${toKMB(tax)}`;
	}
};
