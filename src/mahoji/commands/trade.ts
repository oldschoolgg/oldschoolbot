import { Events } from '@oldschoolgg/toolkit/constants';
import { discrimName, type MahojiUserOption, mentionCommand } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { deferInteraction } from '@/lib/util/interactionReply.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';
import { filterOption } from '@/mahoji/lib/mahojiCommandOptions.js';
import { addToGPTaxBalance, mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const MAX_CHARACTER_LENGTH = 950;

function formatBankForDisplay(bank: Bank): string {
	const fullStr = bank.toStringFull();
	if (fullStr.length > MAX_CHARACTER_LENGTH) {
		return bank.toString(); // abbreviated with toKMB formatting
	}
	return fullStr;
}

export const tradeCommand: OSBMahojiCommand = {
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
		options,
		user
	}: CommandRunOptions<{
		user: MahojiUserOption;
		send?: string;
		receive?: string;
		price?: string;
		filter?: string;
		search?: string;
	}>) => {
		await deferInteraction(interaction);
		if (!guildID) return 'You can only run this in a server.';
		const senderUser = await mUserFetch(userID);
		const senderAPIUser = user;
		const recipientUser = await mUserFetch(options.user.user.id);
		const recipientAPIUser = options.user.user;

		const isBlacklisted = BLACKLISTED_USERS.has(recipientUser.id);
		if (isBlacklisted) return "Blacklisted players can't buy items.";
		if (senderUser.user.minion_ironman || recipientUser.user.minion_ironman) {
			return "Iron players can't trade items.";
		}
		if (recipientUser.id === senderUser.id) return "You can't trade yourself.";
		if (recipientAPIUser.bot) return "You can't trade a bot.";
		if (recipientUser.isBusy) return 'That user is busy right now.';

		const itemsSent =
			!options.search && !options.filter && !options.send
				? new Bank()
				: parseBank({
						inputBank: senderUser.bankWithGP,
						inputStr: options.send,
						maxSize: 70,
						flags: { tradeables: 'tradeables' },
						filters: [options.filter],
						search: options.search,
						noDuplicateItems: true
					}).filter(i => itemIsTradeable(i.id, true));
		const itemsReceived = parseBank({
			inputStr: options.receive,
			maxSize: 70,
			flags: { tradeables: 'tradeables' },
			noDuplicateItems: true
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
		if (!senderUser.owns(itemsSent)) return "You don't own those items.";

		await handleMahojiConfirmation(
			interaction,
			`**${senderUser}** is giving: ${formatBankForDisplay(itemsSent)}
**${recipientUser}** is giving: ${formatBankForDisplay(itemsReceived)}

Both parties must click confirm to make the trade.`,
			[recipientUser.id, senderUser.id]
		);

		await senderUser.sync();
		await recipientUser.sync();
		if (!recipientUser.owns(itemsReceived)) return "They don't own those items.";
		if (!senderUser.owns(itemsSent)) return "You don't own those items.";

		const { success, message } = await tradePlayerItems(senderUser, recipientUser, itemsSent, itemsReceived);
		if (!success) {
			return `Trade failed because: ${message}`;
		}
		await prisma.economyTransaction.create({
			data: {
				guild_id: BigInt(guildID),
				sender: BigInt(senderUser.id),
				recipient: BigInt(recipientUser.id),
				items_sent: itemsSent.toJSON(),
				items_received: itemsReceived.toJSON(),
				type: 'trade'
			}
		});
		globalClient.emit(
			Events.EconomyLog,
			`${senderUser.mention} sold ${itemsSent} to ${recipientUser.mention} for ${itemsReceived}.`
		);
		if (itemsReceived.has('Coins')) {
			await addToGPTaxBalance(recipientUser.id, itemsReceived.amount('Coins'));
		}
		if (itemsSent.has('Coins')) {
			await addToGPTaxBalance(senderUser.id, itemsSent.amount('Coins'));
		}

		const sentFull = itemsSent.toStringFull();
		const receivedFull = itemsReceived.toStringFull();
		const files: { attachment: Buffer; name: string }[] = [];
		if (sentFull.length > MAX_CHARACTER_LENGTH) {
			files.push({ attachment: Buffer.from(sentFull), name: 'items_sent.txt' });
		}
		if (receivedFull.length > MAX_CHARACTER_LENGTH) {
			files.push({ attachment: Buffer.from(receivedFull), name: 'items_received.txt' });
		}

		const content = `${discrimName(senderAPIUser)} sold ${formatBankForDisplay(itemsSent)} to ${discrimName(
			recipientAPIUser
		)} in return for ${formatBankForDisplay(itemsReceived)}.

  You can now buy/sell items in the Grand Exchange: ${mentionCommand(globalClient, 'ge')}`;

		return files.length > 0 ? { content, files } : content;
	}
};
