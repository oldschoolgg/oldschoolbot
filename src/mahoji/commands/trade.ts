import { createHash } from 'node:crypto';
import { TextDecoder } from 'node:util';
import {
	type APIMessage,
	type APIAttachment,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SpecialResponse,
	userMention
} from '@oldschoolgg/discord';
import { Events, ellipsize } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import { filterOption } from '@/discord/index.js';
import { ZItemBank } from '@/lib/structures/Bank.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const MAX_CHARACTER_LENGTH = 950;
const MAX_TRADE_CONFIRMATION_LENGTH = 1950;
const DEFAULT_TRADE_MAX_PULL = 70;
const TRADE_MAX_PULL_REDUCTION_STEP = 10;
const MIN_TRADE_MAX_PULL = 10;
const MAX_TRADE_SYNOPSIS_LENGTH = 1950;
const EMBED_SIDE_LENGTH = 1800;
const MAX_TRADE_FILE_BYTES = 2 * 1024 * 1024;
const TradeConfirmationButtonID = {
	Confirm: 'TRADE_CONFIRM',
	Cancel: 'TRADE_CANCEL'
};
const TradeConfirmationStopReason = {
	AllConfirmed: 'all_confirmed',
	UserCancelled: 'user_cancelled',
	Timeout: 'timeout'
};
type TradeFileOptionName = 'send_file' | 'receive_file';
type TradeFileTextResult = { text: string } | { error: string };

function formatTradeFileError(optionName: TradeFileOptionName, message: string, underlyingError?: string) {
	const prefix = `I couldn't use your ${optionName} attachment. ${message}`;
	if (!underlyingError) return prefix;
	return `${prefix}\n\n\`\`\`text\n${underlyingError}\n\`\`\``;
}

function formatTradeFileParseError(optionName: TradeFileOptionName, underlyingError?: string) {
	const prefix = `I couldn't parse your ${optionName} attachment as an item bank.`;
	if (!underlyingError) return prefix;
	return `${prefix}\n\n\`\`\`text\n${underlyingError}\n\`\`\``;
}

function hasAllowedTradeFileExtension(attachment: APIAttachment) {
	return /\.(?:txt|json)$/i.test(attachment.filename);
}

function hasBinaryTextCharacters(text: string) {
	return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(text);
}

function assertJSONObject(value: unknown): asserts value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('JSON item banks must be an object of item ID keys to quantities.');
	}
}

function assertJSONItemBankUsesIDKeys(bank: Record<string, unknown>) {
	const nonIDKey = Object.keys(bank).find(key => !/^\d+$/.test(key));
	if (nonIDKey) {
		throw new Error('JSON item bank keys must be item IDs only.');
	}
}

function validateJSONItemBank(json: unknown): ItemBank {
	assertJSONObject(json);
	assertJSONItemBankUsesIDKeys(json);
	const parsed = ZItemBank.safeParse(json);
	if (!parsed.success) {
		throw new Error(
			parsed.error.issues.map(issue => `${issue.path.join('.') || 'bank'}: ${issue.message}`).join('\n')
		);
	}
	const parsedKeyCount = Object.keys(parsed.data).length;
	if (parsedKeyCount !== Object.keys(json).length) {
		throw new Error('JSON item bank contains unknown item IDs.');
	}
	return parsed.data;
}

function parseTradeFileBankContent({
	optionName,
	content,
	inputBank
}: {
	optionName: TradeFileOptionName;
	content: string;
	inputBank?: Bank;
}): Bank | string {
	const trimmedContent = content.trim();
	if (!trimmedContent) {
		return formatTradeFileError(optionName, 'Attachment content is empty.');
	}

	try {
		if (trimmedContent[0] === '{') {
			const parsedJSON = JSON.parse(trimmedContent);
			return new Bank(validateJSONItemBank(parsedJSON)).filter(i => itemIsTradeable(i.id, true));
		}

		return parseBank({
			inputBank,
			inputStr: trimmedContent,
			flags: {},
			noDuplicateItems: true
		}).filter(i => itemIsTradeable(i.id, true));
	} catch (err) {
		return formatTradeFileParseError(
			optionName,
			err instanceof Error ? err.message : 'Unknown parsing error.'
		);
	}
}

async function downloadTradeAttachmentText(
	optionName: TradeFileOptionName,
	attachment: APIAttachment
): Promise<TradeFileTextResult> {
	if (!hasAllowedTradeFileExtension(attachment)) {
		return { error: formatTradeFileError(optionName, 'The file must be a .txt or .json file.') };
	}

	if (attachment.size > MAX_TRADE_FILE_BYTES) {
		return {
			error: formatTradeFileError(
				optionName,
				'The file is over 2MB. Use item IDs instead of item names to make it smaller.'
			)
		};
	}

	let response: Response;
	try {
		response = await fetch(attachment.url);
	} catch (err) {
		return {
			error: formatTradeFileError(
				optionName,
				"I couldn't download the file.",
				err instanceof Error ? err.message : 'Unknown download error.'
			)
		};
	}
	if (!response.ok) {
		return {
			error: formatTradeFileError(
				optionName,
				"I couldn't download the file.",
				`${response.status} ${response.statusText}`
			)
		};
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	if (buffer.length > MAX_TRADE_FILE_BYTES) {
		return {
			error: formatTradeFileError(
				optionName,
				'The downloaded file is over 2MB. Use item IDs instead of item names to make it smaller.'
			)
		};
	}

	try {
		const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
		if (hasBinaryTextCharacters(text)) {
			return {
				error: formatTradeFileError(optionName, 'The file must be plaintext UTF-8.', 'Binary data was detected.')
			};
		}
		return { text };
	} catch (err) {
		return {
			error: formatTradeFileError(
				optionName,
				'The file must be plaintext UTF-8.',
				err instanceof Error ? err.message : 'Invalid UTF-8 content.'
			)
		};
	}
}

function formatBankForDisplay(bank: Bank): string {
	const fullStr = bank.toStringFull();
	if (fullStr.length > MAX_CHARACTER_LENGTH) {
		return bank.toString(); // abbreviated with toKMB formatting
	}
	return fullStr;
}

function totalQuantityInBank(bank: Bank): number {
	return bank.items().reduce((sum, [, qty]) => sum + qty, 0);
}

function formatBankItemSummary(bank: Bank): string {
	return `${bank.length.toLocaleString()} different items, ${totalQuantityInBank(bank).toLocaleString()} total quantity`;
}

function tradeHash(bank: Bank): string {
	const hash = createHash('sha256').update(bank.toString()).digest();
	return (hash.readUInt32BE(0) % 1_000_000).toString().padStart(6, '0');
}

function formatTradeHash(itemsSent: Bank, itemsReceived: Bank) {
	return `${tradeHash(itemsSent)} vs ${tradeHash(itemsReceived)}`;
}

function formatTradeItemSummary(senderUser: MUser, recipientUser: MUser, itemsSent: Bank, itemsReceived: Bank) {
	const combinedBank = new Bank().add(itemsSent).add(itemsReceived);
	return `Items: ${senderUser.usernameOrMention}: ${formatBankItemSummary(itemsSent)}; ${
		recipientUser.usernameOrMention
	}: ${formatBankItemSummary(itemsReceived)}; combined: ${formatBankItemSummary(combinedBank)}.`;
}

function formatTradeHashSummary(senderUser: MUser, recipientUser: MUser, itemsSent: Bank, itemsReceived: Bank) {
	return `      *Trade Hash: ${formatTradeHash(itemsSent, itemsReceived)}*
${formatTradeItemSummary(senderUser, recipientUser, itemsSent, itemsReceived)}`;
}

function tradeComposeMainContent(senderUser: MUser, recipientUser: MUser, itemsSent: Bank, itemsReceived: Bank) {
	return `${recipientUser.mention}, ${userMention(senderUser.id)} wants to trade with you.

**${userMention(senderUser.id)}** is giving: ${formatBankForDisplay(itemsSent)}
**${recipientUser.mention}** is giving: ${formatBankForDisplay(itemsReceived)}

${formatTradeHashSummary(senderUser, recipientUser, itemsSent, itemsReceived)}

Both parties must click confirm to make the trade.`;
}

function confirmationMessageLength(content: string, timeoutSeconds: number): number {
	return `${content}\n\nYou have ${timeoutSeconds} seconds to confirm.`.length;
}

function tradeAllowedMentions(senderUser: MUser, recipientUser: MUser): BaseSendableMessage['allowedMentions'] {
	return { users: [senderUser.id, recipientUser.id] };
}

function tradeOfferFileName(user: MUser): string {
	return `${user.username}${user.id.slice(-4)}s_offer.txt`;
}

function buildTradeOfferDisplay(
	user: MUser,
	bankStr: string
): { display: string; file?: { buffer: Buffer; name: string } } {
	if (bankStr.length <= EMBED_SIDE_LENGTH) {
		return { display: bankStr };
	}
	return {
		display: ellipsize(bankStr, EMBED_SIDE_LENGTH),
		file: {
			buffer: Buffer.from(`${user.usernameOrMention} Offers:\n${bankStr}`),
			name: tradeOfferFileName(user)
		}
	};
}

function tradeComposeEmbed(
	senderUser: MUser,
	recipientUser: MUser,
	itemsSent: Bank,
	itemsReceived: Bank
): BaseSendableMessage & { files?: NonNullable<BaseSendableMessage['files']> } {
	const sourceOffer = buildTradeOfferDisplay(senderUser, itemsSent.toString());
	const targetOffer = buildTradeOfferDisplay(recipientUser, itemsReceived.toString());
	const files: NonNullable<BaseSendableMessage['files']> = [];
	if (sourceOffer.file) files.push(sourceOffer.file);
	if (targetOffer.file) files.push(targetOffer.file);

	let description = `${senderUser.usernameOrMention} is offering: ${sourceOffer.display}

${recipientUser.usernameOrMention} is considering trading back: ${targetOffer.display} in exchange.`;
	if (description.length > 4096) description = ellipsize(description, 4096);
	const content = `Hey, ${recipientUser.mention}!

${senderUser.mention} would like to trade with you! See the details below:

${formatTradeHashSummary(senderUser, recipientUser, itemsSent, itemsReceived)}`;
	const message: BaseSendableMessage = {
		content,
		embeds: [
			new EmbedBuilder()
				.setDescription(description)
				.setTitle(`Trade between ${recipientUser.usernameOrMention} and ${senderUser.usernameOrMention}`)
		],
		allowedMentions: { users: [senderUser.id, recipientUser.id] }
	};
	if (files.length > 0) message.files = files;
	return message;
}

function buildTradeCompletionResponse(
	senderUser: MUser,
	recipientUser: MUser,
	itemsSent: Bank,
	itemsReceived: Bank,
	newTradeStyle: boolean
) {
	let synopsis = `Trade completed! ${senderUser.mention} sold ${itemsSent.toStringFull()} to ${
		recipientUser.mention
	} in return for ${itemsReceived.toStringFull()}.`;
	if (newTradeStyle) {
		synopsis += `\n\n${formatTradeHashSummary(senderUser, recipientUser, itemsSent, itemsReceived)}`;
	}

	synopsis += `You can now buy/sell items in the Grand Exchange: ${globalClient.mentionCommand('ge')}`;
	const response: BaseSendableMessage = {
		content: synopsis,
		allowedMentions: tradeAllowedMentions(senderUser, recipientUser)
	};

	if (synopsis.length > MAX_TRADE_SYNOPSIS_LENGTH) {
		response.content = ellipsize(synopsis, MAX_TRADE_SYNOPSIS_LENGTH);
		response.files = [{ buffer: Buffer.from(synopsis), name: 'trade_synopsis.txt' }];
	}

	return response;
}

function tradeConfirmationButtons(): ButtonBuilder[] {
	return [
		new ButtonBuilder()
			.setCustomId(TradeConfirmationButtonID.Confirm)
			.setLabel('Yes')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(TradeConfirmationButtonID.Cancel).setLabel('No').setStyle(ButtonStyle.Danger)
	];
}

async function confirmTradeFollowUp({
	interaction,
	message,
	messageBase,
	content,
	users,
	timeout
}: {
	interaction: MInteraction;
	message: APIMessage;
	messageBase?: BaseSendableMessage;
	content: string;
	users: string[];
	timeout: number;
}): Promise<void> {
	const confirms = new Set<string>();
	const components = tradeConfirmationButtons();

	return new Promise<void>((resolve, reject) => {
		const collector = interaction.client.createInteractionCollector({
			interaction,
			messageId: message.id,
			timeoutMs: timeout,
			users,
			maxCollected: Infinity
		});

		collector.on('collect', async buttonInteraction => {
			if (buttonInteraction.customId === TradeConfirmationButtonID.Cancel) {
				collector.stop(TradeConfirmationStopReason.UserCancelled);
				return;
			}

			if (confirms.has(buttonInteraction.userId)) {
				void buttonInteraction.reply({ ephemeral: true, content: `You have already confirmed.` });
				return;
			}

			confirms.add(buttonInteraction.userId);

			if (buttonInteraction.customId === TradeConfirmationButtonID.Confirm) {
				void buttonInteraction.silentButtonAck();
				if (confirms.size === users.length) {
					collector.stop(TradeConfirmationStopReason.AllConfirmed);
					resolve();
					return;
				}

				const unconfirmedUsernames = await Promise.all(
					users.filter(i => !confirms.has(i)).map(i => interaction.client.fetchUserUsername(i))
				);
				await interaction.editFollowUp(message.id, {
					...messageBase,
					content: `${content}\n\n${confirms.size}/${users.length} confirmed. Waiting for ${unconfirmedUsernames.join(', ')}...`,
					components,
					allowedMentions: { users }
				});
			}
		});

		collector.on('end', async (collected, reason) => {
			if (reason === TradeConfirmationStopReason.AllConfirmed) return resolve();
			if (reason === TradeConfirmationStopReason.UserCancelled) {
				await interaction.editFollowUp(message.id, {
					content: `The confirmation was cancelled.`,
					components: [],
					embeds: []
				});
				return reject(new Error('SILENT_ERROR'));
			}
			if (reason === TradeConfirmationStopReason.Timeout || collected.size !== users.length) {
				await interaction.editFollowUp(message.id, {
					content: `You ran out of time to confirm.`,
					components: [],
					embeds: []
				});
				return reject(new Error('SILENT_ERROR'));
			}
		});
	});
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
			type: 'Attachment',
			name: 'send_file',
			description: 'A plaintext item bank file of items you want to send.',
			required: false
		},
		{
			type: 'String',
			name: 'receive',
			description: 'The items you want to receive from the other player.',
			required: false
		},
		{
			type: 'Attachment',
			name: 'receive_file',
			description: 'A plaintext item bank file of items you want to receive.',
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
		}
	],
	run: async ({ interaction, user: senderUser, guildId, options }) => {
		await interaction.defer();

		if (!guildId) return 'You can only run this in a server.';
		const recipientUser = await mUserFetch(options.user.user.id);

		if (await recipientUser.isBlacklisted()) return "Blacklisted players can't buy items.";
		if (senderUser.user.minion_ironman || recipientUser.user.minion_ironman) {
			return "Iron players can't trade items.";
		}
		if (recipientUser.id === senderUser.id) return "You can't trade yourself.";
		if (options.user.user.bot) return "You can't trade a bot.";
		if (await recipientUser.getIsLocked()) return 'That user is busy right now.';
		if (options.send && options.send_file) return 'Use either send or send_file, not both.';
		if (options.receive && options.receive_file) return 'Use either receive or receive_file, not both.';
		if (options.send_file && (options.filter || options.search || options.all)) {
			return 'You cannot use send_file with filter, search, or all.';
		}

		const extraSettings = await ClientSettings.getExtraSettings();
		let fileItemsSent: Bank | undefined;
		let fileItemsReceived: Bank | undefined;

		if (options.send_file) {
			const sendFileText = await downloadTradeAttachmentText('send_file', options.send_file);
			if ('error' in sendFileText) return sendFileText.error;
			const parsed = parseTradeFileBankContent({
				optionName: 'send_file',
				content: sendFileText.text,
				inputBank: senderUser.bankWithGP
			});
			if (typeof parsed === 'string') return parsed;
			fileItemsSent = parsed;
		}

		if (options.receive_file) {
			const receiveFileText = await downloadTradeAttachmentText('receive_file', options.receive_file);
			if ('error' in receiveFileText) return receiveFileText.error;
			const parsed = parseTradeFileBankContent({
				optionName: 'receive_file',
				content: receiveFileText.text
			});
			if (typeof parsed === 'string') return parsed;
			fileItemsReceived = parsed;
		}

		// Need to use a new followUp() message to ping because we use defer()
		function tradeConfirmationMsg(tradeTimeout: number) {
			return `${recipientUser.mention}, ${senderUser.mention} wants to trade with you. Review the trade details above, then confirm if you accept.\n\nYou have ${Math.floor(tradeTimeout / 1000)} seconds to confirm.`;
		}

		function parseTradeBanks(maxSize: number) {
			const parsedItemsSent =
				(fileItemsSent ? new Bank(fileItemsSent) : undefined) ??
				(!options.search && !options.filter && !options.send && !options.all
					? new Bank()
					: parseBank({
							inputBank: senderUser.bankWithGP,
							inputStr: options.send,
							maxSize: options.all === true ? undefined : maxSize,
							flags: {},
							filters: [options.filter],
							search: options.search,
							noDuplicateItems: true
						}).filter(i => itemIsTradeable(i.id, true)));
			const parsedItemsReceived =
				(fileItemsReceived ? new Bank(fileItemsReceived) : undefined) ??
				parseBank({
					inputStr: options.receive,
					maxSize,
					flags: {},
					noDuplicateItems: true
				}).filter(i => itemIsTradeable(i.id, true));

			if (options.price) {
				const gp = mahojiParseNumber({ input: options.price, min: 1 });
				if (gp) {
					parsedItemsReceived.add('Coins', gp);
				}
			}

			return { itemsSent: parsedItemsSent, itemsReceived: parsedItemsReceived };
		}

		let tradeMaxPull = extraSettings.tradeMaxPull ?? DEFAULT_TRADE_MAX_PULL;
		let { itemsSent, itemsReceived } = parseTradeBanks(tradeMaxPull);
		let mainContent = tradeComposeMainContent(senderUser, recipientUser, itemsSent, itemsReceived);
		const tradeTimeout = extraSettings.tradeTimeout * 1000;
		const tradeEmbedTimeout = extraSettings.tradeEmbedTimeout * 1000;

		const allItems = new Bank().add(itemsSent).add(itemsReceived);
		if (allItems.items().some(i => !itemIsTradeable(i[0].id, true))) {
			return "You're trying to trade untradeable items.";
		}

		if (itemsSent.length === 0 && itemsReceived.length === 0) return "You can't make an empty trade.";

		await senderUser.sync();
		if (!senderUser.owns(itemsSent)) return "You don't own those items.";

		const needsEmbed =
			confirmationMessageLength(mainContent, extraSettings.tradeTimeout) > MAX_TRADE_CONFIRMATION_LENGTH;

		const usersToConfirm = [recipientUser.id, senderUser.id];

		let tradeMessage: APIMessage;
		let confirmationMessage: APIMessage;
		if (needsEmbed) {
			const embedMessage = tradeComposeEmbed(
				senderUser,
				recipientUser,
				itemsSent,
				itemsReceived
			);
			// Is the response too big for an embed?
			if (Boolean(embedMessage.files?.length)) {
				tradeMessage = await interaction.followUp(embedMessage);
				const content = tradeConfirmationMsg(tradeEmbedTimeout);

				confirmationMessage = await interaction.followUp({
					content,
					components: tradeConfirmationButtons(),
					allowedMentions: tradeAllowedMentions(senderUser, recipientUser)
				});
				await confirmTradeFollowUp({
					interaction,
					message: confirmationMessage,
					content,
					users: usersToConfirm,
					timeout: tradeEmbedTimeout
				});
				await interaction.editFollowUp(confirmationMessage.id, { content: 'Trade confirmed.', components: [] });
			} else {
				const content = `${embedMessage.content}\n\nYou have ${Math.floor(tradeEmbedTimeout / 1000)} seconds to confirm.`;
				confirmationMessage =
				tradeMessage = await interaction.followUp({
					...embedMessage,
					content,
					components: tradeConfirmationButtons()
				});
				await confirmTradeFollowUp({
					interaction,
					message: tradeMessage,
					messageBase: embedMessage,
					content: embedMessage.content!,
					users: usersToConfirm,
					timeout: tradeEmbedTimeout
				});
			}
		} else {
			const content = `${mainContent}\n\nYou have ${Math.floor(tradeTimeout / 1000)} seconds to confirm.`;
			confirmationMessage = await interaction.followUp({
				content,
				components: tradeConfirmationButtons(),
				allowedMentions: tradeAllowedMentions(senderUser, recipientUser)
			});
			await confirmTradeFollowUp({
				interaction,
				message: confirmationMessage,
				content: mainContent,
				users: usersToConfirm,
				timeout: tradeTimeout
			});
		}

		// Don't sync now because the tradePlayerItems syncs already
		if (!recipientUser.owns(itemsReceived)) {
			await interaction.editFollowUp(confirmationMessage.id, {
				content: "They don't own those items.",
				components: [],
				clearAttachments: true
			});
			return SpecialResponse.RespondedManually;
		}
		if (!senderUser.owns(itemsSent)) {
			await interaction.editFollowUp(tradeMessage.id, {
				content: "You don't own those items.",
				components: [],
				clearAttachments: true
			});
			return SpecialResponse.RespondedManually;
		}

		const { success, message } = await tradePlayerItems(senderUser, recipientUser, itemsSent, itemsReceived);
		if (!success) {
			await interaction.editFollowUp(tradeMessage.id, {
				content: `Trade failed because: ${message}`,
				components: [],
				clearAttachments: true
			});
			return SpecialResponse.RespondedManually;
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

		const completionResponse = buildTradeCompletionResponse(
			senderUser,
			recipientUser,
			itemsSent,
			itemsReceived,
			newTradeStyle
		);
		await interaction.editFollowUp(tradeMessage.id, { ...completionResponse, clearAttachments: true });
		return SpecialResponse.RespondedManually;
	}
});
