import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { prisma } from '../../lib/settings/prisma';
import { discrimName } from '../../lib/util';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { parseBank } from '../../lib/util/parseStringBank';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiClientSettingsFetch, MahojiUserOption } from '../mahojiSettings';

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
		}
	],
	run: async ({
		interaction,
		userID,
		guildID,
		options
	}: CommandRunOptions<{ user: MahojiUserOption; send?: string; receive?: string }>) => {
		if (!guildID) return 'You can only run this in a server.';
		const senderKlasaUser = await client.fetchUser(userID);
		const recipientKlasaUser = await client.fetchUser(options.user.user.id);
		const settings = await mahojiClientSettingsFetch({ userBlacklist: true });

		const isBlacklisted = settings.userBlacklist.includes(recipientKlasaUser.id);
		if (isBlacklisted) return "Blacklisted players can't buy items.";
		if (senderKlasaUser.isIronman || recipientKlasaUser.isIronman) return "Iron players can't trade items.";
		if (recipientKlasaUser.id === senderKlasaUser.id) return "You can't trade yourself.";
		if (recipientKlasaUser.bot) return "You can't trade a bot.";
		if (recipientKlasaUser.isBusy) return 'That user is busy right now.';

		const itemsSent = parseBank({
			inputBank: senderKlasaUser.bank({ withGP: true }),
			inputStr: options.send,
			maxSize: 70,
			flags: { tradeables: 'tradeables' }
		}).filter(i => itemIsTradeable(i.id));
		const itemsReceived = parseBank({
			inputStr: options.receive,
			maxSize: 70,
			flags: { tradeables: 'tradeables' }
		}).filter(i => itemIsTradeable(i.id));

		if (itemsSent.length === 0 && itemsReceived.length === 0) return "You can't make an empty trade.";
		if (!senderKlasaUser.owns(itemsSent)) return "You don't own those items.";
		if (!recipientKlasaUser.owns(itemsReceived)) return "They don't own those items.";

		await handleMahojiConfirmation(
			interaction,
			`${senderKlasaUser} are you sure you want to *give* ${itemsSent} to ${discrimName(
				recipientKlasaUser
			)} in return for ${itemsReceived}?`
		);
		await handleMahojiConfirmation(
			interaction,
			`${recipientKlasaUser} are you sure you want to *give* ${itemsReceived} to ${discrimName(
				senderKlasaUser
			)} in return for ${itemsSent}?`,
			BigInt(recipientKlasaUser.id)
		);

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
				items_received: itemsReceived.bank
			}
		});

		return `${discrimName(senderKlasaUser)} sold ${itemsSent} to ${discrimName(
			recipientKlasaUser
		)} in return for ${itemsReceived}.`;
	}
};
