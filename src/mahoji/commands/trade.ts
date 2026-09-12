import { EmbedBuilder } from '@oldschoolgg/discord';
import { Events, ellipsize } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { choicesOf, filterOption } from '@/discord/index.js';
import { type BankSortMethod, BankSortMethods, sorts } from '@/lib/sorts.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const DEFAULT_TRADE_MAX_PULL = 70;
const MAX_TRADE_MESSAGE_LENGTH = 2000;
const MAX_TRADE_SYNOPSIS_LENGTH = 1950;
const TradeOrder = ['asc', 'desc'] as const;
type TradeOrder = (typeof TradeOrder)[number];

function tradeBankSort(sort?: BankSortMethod, order: TradeOrder = 'desc') {
	if (!sort) return undefined;
	const comparator =
		sort === 'name'
			? sorts.name
			: (a: Parameters<typeof sorts.value>[0], b: Parameters<typeof sorts.value>[1]) => -sorts[sort](a, b);
	return { method: comparator, direction: order } as const;
}

function trimTradeBank(bank: Bank, maxSize: number | undefined, sort?: BankSortMethod, order?: TradeOrder): Bank {
	return bank.trim(maxSize ?? bank.length, tradeBankSort(sort, order));
}

export function parseTradeSource({
	inputBank,
	inputStr,
	filters,
	search,
	maxSize,
	sort,
	order
}: {
	inputBank?: Bank;
	inputStr?: string;
	filters?: (string | undefined)[];
	search?: string;
	maxSize?: number;
	sort?: BankSortMethod;
	order?: TradeOrder;
}): Bank {
	return trimTradeBank(
		parseBank({
			inputBank,
			inputStr,
			flags: {},
			filters,
			search,
			maxSize,
			noDuplicateItems: true
		}).filter(i => itemIsTradeable(i.id, true)),
		maxSize,
		sort,
		order
	);
}

function buildTradeDetailsEmbed(
	senderUser: MUser,
	recipientUser: MUser,
	itemsSent: Bank,
	itemsReceived: Bank
): EmbedBuilder {
	let description = `${senderUser.usernameOrMention} is offering:
${itemsSent.toString()}

	${recipientUser.usernameOrMention} is offering:
${itemsReceived.toString()}`;
	if (description.length > 4096) description = ellipsize(description, 4096);
	return new EmbedBuilder()
		.setDescription(description)
		.setTitle(`Trade between ${recipientUser.usernameOrMention} and ${senderUser.usernameOrMention}`);
}

function buildTradeConfirmationMessage(
	senderUser: MUser,
	recipientUser: MUser,
	itemsSent: Bank,
	itemsReceived: Bank
): BaseSendableMessage {
	const content = `Hi ${recipientUser.mention}, ${senderUser.mention} would like to trade with you! Review the trade and click Yes to confirm, or No to cancel.`;
	const details = `${senderUser.usernameOrMention} is offering:\n${itemsSent.toString()}\n\n${recipientUser.usernameOrMention} is offering:\n${itemsReceived.toString()}`;
	if (`${content}\n\n${details}`.length <= MAX_TRADE_MESSAGE_LENGTH) {
		return { content: `${content}\n\n${details}` };
	}
	return {
		content,
		embeds: [buildTradeDetailsEmbed(senderUser, recipientUser, itemsSent, itemsReceived)]
	};
}

function buildTradeCompletionResponse(senderUser: MUser, recipientUser: MUser, itemsSent: Bank, itemsReceived: Bank) {
	const synopsis = `Trade completed! ${senderUser.mention} sold ${itemsSent.toStringFull()} to ${
		recipientUser.mention
	} in return for ${itemsReceived.toStringFull()}.`;

	const response: BaseSendableMessage = {
		content: synopsis
	};

	if (synopsis.length > MAX_TRADE_SYNOPSIS_LENGTH) {
		response.content = ellipsize(synopsis, MAX_TRADE_SYNOPSIS_LENGTH);
		response.files = [{ buffer: Buffer.from(synopsis), name: 'trade_synopsis.txt' }];
	}

	return response;
}

export const tradeCommand = defineCommand({
	name: 'trade',
	flags: ['REQUIRES_LOCK'],
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
			description: 'The items you want to receive from the other player.',
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
		},
		{
			type: 'Boolean',
			name: 'all',
			description: 'Send all matching items with no max limit.',
			required: false
		},
		{
			type: 'String',
			name: 'sort',
			description: 'Sort matching items before applying the max limit.',
			required: false,
			choices: choicesOf(BankSortMethods)
		},
		{
			type: 'String',
			name: 'order',
			description: 'Sort order for the selected sort method.',
			required: false,
			choices: choicesOf(TradeOrder)
		},
		{
			type: 'Integer',
			name: 'max_size',
			description: 'Maximum distinct items to trade, up to the configured limit.',
			required: false,
			min_value: 1
		}
	],
	run: async ({ interaction, user: senderUser, guildId, options }) => {
		if (!guildId) return 'You can only run this in a server.';
		const recipientUser = await mUserFetch(options.user.user.id);

		if (await recipientUser.isBlacklisted()) return "Blacklisted players can't buy items.";
		if (senderUser.user.minion_ironman || recipientUser.user.minion_ironman) {
			return "Iron players can't trade items.";
		}
		if (recipientUser.id === senderUser.id) return "You can't trade yourself.";
		if (options.user.user.bot) return "You can't trade a bot.";
		if (await recipientUser.getIsLocked()) return 'That user is busy right now.';

		const extraSettings = await ClientSettings.getExtraSettings();
		const tryAllowAll = extraSettings.tradeAllowAll;
		const tradeMaxPull = extraSettings.tradeMaxPull ?? DEFAULT_TRADE_MAX_PULL;
		const maxSize = Math.min(options.max_size ?? tradeMaxPull, tradeMaxPull);
		const sendMaxSize = tryAllowAll && options.all && options.max_size === undefined ? undefined : maxSize;

		function parseTradeBanks(maxSize: number | undefined) {
			const parsedItemsSent =
				!options.search && !options.filter && !options.send && !options.all
					? new Bank()
					: parseTradeSource({
							inputBank: senderUser.bankWithGP,
							inputStr: options.send,
							filters: [options.filter],
							search: options.search,
							maxSize,
							sort: options.sort,
							order: options.order
						});
			const parsedItemsReceived = parseTradeSource({
				inputStr: options.receive,
				maxSize,
				sort: options.sort,
				order: options.order
			});

			if (options.price) {
				const gp = mahojiParseNumber({ input: options.price, min: 1 });
				if (gp) {
					parsedItemsReceived.add('Coins', gp);
				}
			}

			return { itemsSent: parsedItemsSent, itemsReceived: parsedItemsReceived };
		}

		const { itemsSent, itemsReceived } = parseTradeBanks(sendMaxSize);
		const tradeTimeout = extraSettings.tradeTimeout * 1000;

		if (itemsSent.items().some(i => !itemIsTradeable(i[0].id, true))) {
			return "You're trying to trade untradeable items.";
		}
		if (itemsReceived.items().some(i => !itemIsTradeable(i[0].id, true))) {
			return "You're trying to trade untradeable items.";
		}

		if (itemsSent.length === 0 && itemsReceived.length === 0) return "You can't make an empty trade.";

		await senderUser.sync();
		if (!senderUser.owns(itemsSent)) return "You don't own those items.";

		const usersToConfirm = [recipientUser.id, senderUser.id];

		const confirmationContent = buildTradeConfirmationMessage(senderUser, recipientUser, itemsSent, itemsReceived);
		await interaction.confirmation({
			content: confirmationContent.content!,
			embeds: confirmationContent.embeds,
			users: usersToConfirm,
			timeout: tradeTimeout
		});

		// Don't sync now because the tradePlayerItems syncs already
		if (!recipientUser.owns(itemsReceived)) {
			return "They don't own those items.";
		}
		if (!senderUser.owns(itemsSent)) {
			return "You don't own those items.";
		}

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

		const completionResponse = buildTradeCompletionResponse(senderUser, recipientUser, itemsSent, itemsReceived);
		return completionResponse;
	}
});
