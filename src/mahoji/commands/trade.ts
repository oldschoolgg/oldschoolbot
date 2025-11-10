import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { filterOption } from '@/discord/index.js';
import { BLACKLISTED_USERS } from '@/lib/cache.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const MAX_CHARACTER_LENGTH = 950;

function formatBankForDisplay(bank: Bank): string {
	const fullStr = bank.toStringFull();
	if (fullStr.length > MAX_CHARACTER_LENGTH) {
		return bank.toString(); // abbreviated with toKMB formatting
	}
	return fullStr;
}

export const tradeCommand = defineCommand({
	name: 'trade',
	description: 'Allows you to trade items with other players.',
	options: [
		{
			type: 'User',
			name: 'user',
			description: 'The user you want to trade items with.',
			required: true
		},
		{
			type: 'String',
			name: 'send',
			description: 'The items you want to send to the other player.',
			required: false
		},
		{
			type: 'String',
			name: 'receive',
			description: 'The items you want to receieve from the other player.',
			required: false
		},
		{
			type: 'String',
			name: 'price',
			description: 'A shortcut for adding GP to the received items.',
			required: false
		},
		filterOption,
		{
			type: 'String',
			name: 'search',
			description: 'An optional search of items by name.',
			required: false
		}
	],
	run: async ({ interaction, user: senderUser, guildId, options }) => {
		await interaction.defer();

		if (!guildId) return 'You can only run this in a server.';
		const recipientUser = await mUserFetch(options.user.user.id);
		const recipientAPIUser = options.user.user;

		const isBlacklisted = BLACKLISTED_USERS.has(recipientUser.id);
		if (isBlacklisted) return "Blacklisted players can't buy items.";
		if (senderUser.user.minion_ironman || recipientUser.user.minion_ironman) {
			return "Iron players can't trade items.";
		}
		if (recipientUser.id === senderUser.id) return "You can't trade yourself.";
		if (recipientAPIUser.bot) return "You can't trade a bot.";
		if (await recipientUser.getIsLocked()) return 'That user is busy right now.';

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

		await senderUser.sync();
		if (!senderUser.owns(itemsSent)) return "You don't own those items.";

		await interaction.confirmation({
			content: `**${senderUser}** is giving: ${formatBankForDisplay(itemsSent)}
**${recipientUser}** is giving: ${formatBankForDisplay(itemsReceived)}

Both parties must click confirm to make the trade.`,
			users: [recipientUser.id, senderUser.id]
		});

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
				guild_id: BigInt(guildId),
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
			await ClientSettings.addToGPTaxBalance(recipientUser, itemsReceived.amount('Coins'));
		}
		if (itemsSent.has('Coins')) {
			await ClientSettings.addToGPTaxBalance(senderUser, itemsSent.amount('Coins'));
		}

		const sentFull = itemsSent.toStringFull();
		const receivedFull = itemsReceived.toStringFull();
		const files: { buffer: Buffer; name: string }[] = [];
		if (sentFull.length > MAX_CHARACTER_LENGTH) {
			files.push({ buffer: Buffer.from(sentFull), name: 'items_sent.txt' });
		}
		if (receivedFull.length > MAX_CHARACTER_LENGTH) {
			files.push({ buffer: Buffer.from(receivedFull), name: 'items_received.txt' });
		}

		const content = `${senderUser.username} sold ${formatBankForDisplay(itemsSent)} to ${recipientAPIUser.username} in return for ${formatBankForDisplay(itemsReceived)}.

  You can now buy/sell items in the Grand Exchange: ${globalClient.mentionCommand('ge')}`;

		return files.length > 0 ? { content, files } : content;
	}
});
