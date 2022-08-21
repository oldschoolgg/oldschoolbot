import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { Events } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { addToGPTaxBalance, discrimName, truncateString } from '../../lib/util';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiParseNumber } from '../mahojiSettings';

export const askCommand: OSBMahojiCommand = {
	name: 'trade',
	description: 'Allows you to trade items with other players.',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'user',
			description: 'The user you want to trade items with.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'send',
			description: 'The items you want to send to the other player.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'receive',
			description: 'The items you want to receieve from the other player.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'price',
			description: 'A shortcut for adding GP to the received items.',
			required: false
		},
		filterOption,
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'An optional search of items by name.',
			required: false
		}
	],
	run: async ({
		interaction,
		userID,
		guildID,
		options
	}: CommandRunOptions<{
		user: MahojiUserOption;
		send?: string;
		receive?: string;
		price?: string;
		filter?: string;
		search?: string;
	}>) => {
		if (!guildID) return 'You can only run this in a server.';
		const senderKlasaUser = await globalClient.fetchUser(userID);
		const recipientKlasaUser = await globalClient.fetchUser(options.user.user.id);

		const isBlacklisted = BLACKLISTED_USERS.has(recipientKlasaUser.id);
		if (isBlacklisted) return "Blacklisted players can't buy items.";
		if (senderKlasaUser.isIronman || recipientKlasaUser.isIronman) return "Iron players can't trade items.";
		if (recipientKlasaUser.id === senderKlasaUser.id) return "You can't trade yourself.";
		if (recipientKlasaUser.bot) return "You can't trade a bot.";
		if (recipientKlasaUser.isBusy) return 'That user is busy right now.';

		const itemsSent =
			!options.search && !options.filter && !options.send
				? new Bank()
				: parseBank({
						inputBank: senderKlasaUser.bank({ withGP: true }),
						inputStr: options.send,
						maxSize: 70,
						flags: { tradeables: 'tradeables' },
						filters: [options.filter],
						search: options.search
				  }).filter(i => itemIsTradeable(i.id, true));
		const itemsReceived = parseBank({
			inputStr: options.receive,
			maxSize: 70,
			flags: { tradeables: 'tradeables' }
		}).filter(i => itemIsTradeable(i.id, true));

		if (options.price) {
			const gp = mahojiParseNumber({ input: options.price, min: 1 });
			if (gp) {
				itemsReceived.add('Coins', gp);
			}
		}

		const allItems = new Bank().add(itemsSent).add(itemsReceived);
		if (allItems.items().some(i => !itemIsTradeable(i[0].id, true))) {
			return "You're trying to trade untradeable items.";
		}

		if (itemsSent.length === 0 && itemsReceived.length === 0) return "You can't make an empty trade.";
		if (!senderKlasaUser.owns(itemsSent)) return "You don't own those items.";

		await handleMahojiConfirmation(
			interaction,
			`**${senderKlasaUser}** is giving: ${truncateString(itemsSent.toString(), 950)}
**${recipientKlasaUser}** is giving: ${truncateString(itemsReceived.toString(), 950)}

Both parties must click confirm to make the trade.`,
			[recipientKlasaUser.id, senderKlasaUser.id]
		);

		if (!recipientKlasaUser.owns(itemsReceived)) return "They don't own those items.";

		await Promise.all([
			senderKlasaUser.removeItemsFromBank(itemsSent),
			senderKlasaUser.addItemsToBank({ items: itemsReceived, collectionLog: false }),

			recipientKlasaUser.removeItemsFromBank(itemsReceived),
			recipientKlasaUser.addItemsToBank({ items: itemsSent, collectionLog: false })
		]);

		await prisma.economyTransaction.create({
			data: {
				guild_id: guildID,
				sender: BigInt(senderKlasaUser.id),
				recipient: BigInt(recipientKlasaUser.id),
				items_sent: itemsSent.bank,
				items_received: itemsReceived.bank,
				type: 'trade'
			}
		});
		globalClient.emit(
			Events.EconomyLog,
			`${senderKlasaUser.sanitizedName} sold ${itemsSent} to ${recipientKlasaUser.sanitizedName} for ${itemsReceived}.`
		);
		if (itemsReceived.has('Coins')) {
			addToGPTaxBalance(recipientKlasaUser.id, itemsReceived.amount('Coins'));
		}
		if (itemsSent.has('Coins')) {
			addToGPTaxBalance(senderKlasaUser.id, itemsSent.amount('Coins'));
		}

		return `${discrimName(senderKlasaUser)} sold ${itemsSent} to ${discrimName(
			recipientKlasaUser
		)} in return for ${itemsReceived}.`;
	}
};
