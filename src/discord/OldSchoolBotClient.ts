import { DiscordAPIError } from '@discordjs/rest';
import { WebSocketShardEvents } from '@discordjs/ws';
import {
	type APIApplication,
	type APIUser,
	type BaseSendableMessage,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	collectSingleInteraction,
	DiscordClient,
	type DiscordClientOptions,
	type GatewayMessageCreateDispatchData,
	Routes
} from '@oldschoolgg/discord';
import type { IChannel, IMessage, IUserLog, IWebhook } from '@oldschoolgg/schemas';
import { Time } from '@oldschoolgg/toolkit';
import { DiscordSnowflake } from '@sapphire/snowflake';
import type { APIWebhook } from 'discord-api-types/v10';
import { omit } from 'remeda';

import { makeParty } from '@/discord/interaction/makeParty.js';
import { mentionCommand } from '@/discord/utils.js';
import { DISCORD_USER_IDS_INSERTED_CACHE } from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

const MAX_MESSAGE_LENGTH = 1950;

function splitContentIntoMessages(content: string): string[] {
	if (content.length <= MAX_MESSAGE_LENGTH) return [content];

	const parts: string[] = [];
	let remaining = content;
	while (remaining.length > MAX_MESSAGE_LENGTH) {
		let splitAt = -1;
		for (let i = MAX_MESSAGE_LENGTH; i >= 0; i--) {
			const char = remaining[i];
			if (char === '\n' || char === ' ' || char === '\t') {
				splitAt = i;
				break;
			}
		}
		if (splitAt <= 0) {
			splitAt = MAX_MESSAGE_LENGTH;
		}
		parts.push(remaining.slice(0, splitAt).trimEnd());
		remaining = remaining.slice(splitAt).trimStart();
	}
	if (remaining.length > 0) {
		parts.push(remaining);
	}
	return parts;
}

async function resolveBotSendableMessage(rawMessage: SendableMessage): Promise<BaseSendableMessage> {
	if (typeof rawMessage === 'string') {
		return { content: rawMessage };
	}
	if ('build' in rawMessage) {
		return resolveBotSendableMessage(await rawMessage.build());
	}
	return rawMessage;
}

function splitSendableMessage(rawMessage: BaseSendableMessage): BaseSendableMessage[] {
	const content = rawMessage.content ?? '';
	const contentParts = splitContentIntoMessages(content);
	if (contentParts.length === 1) return [rawMessage];

	return contentParts.map((part, index) => {
		const isLast = index === contentParts.length - 1;
		return {
			content: part,
			allowedMentions: rawMessage.allowedMentions,
			...(isLast
				? {
						components: rawMessage.components,
						embeds: rawMessage.embeds,
						files: rawMessage.files,
						ephemeral: rawMessage.ephemeral,
						messageReference: rawMessage.messageReference,
						threadId: rawMessage.threadId,
						withResponse: rawMessage.withResponse
					}
				: {})
		};
	});
}

export class OldSchoolBotClient extends DiscordClient {
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;

	constructor(options: DiscordClientOptions) {
		super(options);
		this.on('ready', async e => {
			await this.handleReadyEvent(e);
		});
		this.ws.on(WebSocketShardEvents.Error, p => {
			Logging.logDebug(`WS Error: ${p.message}`);
			Logging.logError({
				err: p,
				context: {
					source: 'WebSocketShardEvents.Error'
				}
			});
		});
		this.ws.on(WebSocketShardEvents.SocketError, p => {
			Logging.logDebug(`WS SocketError: ${p.message}`);
			Logging.logError({
				err: p,
				context: {
					source: 'WebSocketShardEvents.SocketError'
				}
			});
		});
		this.ws.on(WebSocketShardEvents.Closed, p => {
			Logging.logDebug(`WS Closed: ${p}`);
		});
		this.ws.on(WebSocketShardEvents.Resumed, p => {
			Logging.logDebug(`WS Resumed: ${p}`);
		});
	}

	async upsertDiscordUser(user: APIUser) {
		if (DISCORD_USER_IDS_INSERTED_CACHE.has(user.id)) return;
		const data = {
			id: user.id,
			username: user.username,
			global_name: user.global_name,
			avatar: user.avatar,
			created_at: new Date(DiscordSnowflake.timestampFrom(user.id))
		} as const;
		await roboChimpClient.discordUser
			.upsert({
				where: {
					id: user.id
				},
				create: data,
				update: data
			})
			.catch(err => Logging.logError(err));
		DISCORD_USER_IDS_INSERTED_CACHE.add(user.id);
	}

	mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
		return mentionCommand(name, subCommand, subSubCommand);
	}

	private async handleReadyEvent({ application }: { application: APIApplication }) {
		// Add owner to admin user IDs
		const ownerId = application.owner?.id;
		if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
			globalConfig.adminUserIDs.push(ownerId);
		}

		Logging.logDebug(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
	}

	private async deleteWebhook(channelId: string): Promise<void> {
		await Promise.all([
			Cache.clearWebhook(channelId),
			prisma.webhook.deleteMany({ where: { channel_id: channelId } })
		]);
	}

	private async getChannelWebhook(channelId: string): Promise<IWebhook | null> {
		const cachedWebhook = await Cache.getWebhook(channelId);
		if (cachedWebhook) return cachedWebhook;
		const storedWebhook = await prisma.webhook.findUnique({ where: { channel_id: channelId } });
		if (!storedWebhook) return null;
		const webhook: IWebhook = {
			id: storedWebhook.webhook_id,
			token: storedWebhook.webhook_token,
			channel_id: channelId
		};
		await Cache.setWebhook(webhook);
		return webhook;
	}

	private async botCanCreateWebhooks(channelId: string): Promise<boolean> {
		const botId = this.application?.bot?.id;
		if (!botId) return false;
		const channel = await Cache.getChannel(channelId);
		if (!channel.guild_id) return false;
		const botMember = await Cache.getMember({ guildId: channel.guild_id, userId: botId });
		return Boolean(
			botMember?.permissions.includes('MANAGE_WEBHOOKS') || botMember?.permissions.includes('ADMINISTRATOR')
		);
	}

	private formatWebhook(channelId: string, webhook: APIWebhook): IWebhook | null {
		if (!webhook.token) return null;
		return {
			id: webhook.id,
			token: webhook.token,
			channel_id: channelId
		};
	}

	private async storeWebhook(webhook: IWebhook): Promise<void> {
		await Promise.all([
			Cache.setWebhook(webhook),
			prisma.webhook.upsert({
				where: { channel_id: webhook.channel_id },
				create: {
					channel_id: webhook.channel_id,
					webhook_id: webhook.id,
					webhook_token: webhook.token
				},
				update: {
					webhook_id: webhook.id,
					webhook_token: webhook.token
				}
			})
		]);
	}

	private async getOrCreateChannelWebhook(channelId: string): Promise<IWebhook | null> {
		const existingWebhook = await this.getChannelWebhook(channelId);
		if (existingWebhook) return existingWebhook;
		if (!(await this.botCanCreateWebhooks(channelId))) return null;
		const createdWebhook = this.formatWebhook(channelId, await this.createWebhook(channelId));
		if (!createdWebhook) return null;
		await this.storeWebhook(createdWebhook);
		return createdWebhook;
	}

	private isInvalidWebhookError(err: unknown): boolean {
		return (
			(err instanceof DiscordAPIError && err.code === 10_015) ||
			(err instanceof Error &&
				(err.message?.includes('Unknown Webhook') || err.message?.includes('Invalid Webhook Token')))
		);
	}

	private async sendToWebhook(channelId: string, data: SendableMessage): Promise<IMessage | null> {
		try {
			const webhook = await this.getOrCreateChannelWebhook(channelId);
			if (!webhook) return null;
			return globalClient.sendWebhook(webhook, data);
		} catch (_err: unknown) {
			const err = _err as Error;
			if (this.isInvalidWebhookError(err)) {
				Logging.logDebug(`Deleting unknown webhook in ${channelId}`);
				await this.deleteWebhook(channelId);
			} else {
				Logging.logError(err);
			}
			return null;
		}
	}

	async sendMessageOrWebhook(channelId: string, rawMessage: SendableMessage): Promise<IMessage | null> {
		const message = await resolveBotSendableMessage(rawMessage);
		const splitMessages = splitSendableMessage(message);
		let firstResponse: IMessage | null = null;

		for (const part of splitMessages) {
			const webhookResponse = await this.sendToWebhook(channelId, part);
			if (webhookResponse) {
				firstResponse ??= webhookResponse;
				continue;
			}
			try {
				const messageResponse = await this.sendMessage(channelId, part);
				firstResponse ??= messageResponse;
			} catch {
				// Preserve the previous behavior of swallowing send failures in this fallback wrapper.
			}
		}
		return firstResponse;
	}

	async channelIsSendable(channelId: IChannel | string): Promise<boolean> {
		const channel = typeof channelId === 'string' ? await Cache.getChannel(channelId) : channelId;
		if (!channel) return false;
		if (
			![ChannelType.DM, ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
				channel.type
			)
		) {
			return false;
		}
		return true;
	}

	async pickStringWithButtons({
		options,
		content,
		interaction,
		allowedUsers
	}: {
		allowedUsers?: string[];
		interaction: MInteraction;
		options: { label?: string; id: string; emoji?: string }[];
		content: string;
	}): Promise<{ choice: { label?: string; id: string; emoji?: string }; userId: string } | null> {
		const CUSTOM_ID_PREFIX = `DYN_PICK_STRING_BUTTON_`;
		try {
			const buttons = options.map(opt => {
				const button = new ButtonBuilder()
					.setCustomId(`${CUSTOM_ID_PREFIX}${opt.id}`)
					.setStyle(ButtonStyle.Secondary);
				if (opt.emoji) {
					button.setEmoji({ id: opt.emoji });
				}
				if (opt.label) {
					button.setLabel(opt.label);
				}
				return button;
			});
			allowedUsers ??= [interaction.userId];
			await interaction.defer();
			const msg = await interaction.replyWithResponse({
				content,
				components: buttons,
				withResponse: true
			});
			const res = await collectSingleInteraction({
				interaction,
				messageId: msg!.message_id,
				channelId: interaction.channelId,
				users: allowedUsers,
				timeoutMs: Time.Second * 30
			});
			if (!res) return null;
			res.silentButtonAck();
			const resId = res.customId!.replace(CUSTOM_ID_PREFIX, '');
			const choice = options.find(o => o.id === resId)!;
			return { choice, userId: res.userId };
		} catch (err) {
			Logging.logError(err as Error);
			return null;
		}
	}

	async makeParty(options: MakePartyOptions): Promise<MUser[]> {
		return makeParty(options);
	}

	async reactToMsg({
		channelId,
		messageId,
		emojiId
	}: {
		channelId: string;
		messageId: string;
		emojiId: keyof typeof ReactEmoji;
	}) {
		const route = Routes.channelMessageOwnReaction(channelId, messageId, encodeURIComponent(ReactEmoji[emojiId]));
		await this.rest.put(route);
	}

	async awaitMessages({
		channelId,
		max = 1,
		time = Time.Second * 30,
		errors = [],
		filter = () => true
	}: {
		channelId: string;
		max?: number;
		time?: number;
		errors?: string[];
		filter?: (msg: GatewayMessageCreateDispatchData) => boolean;
	}): Promise<GatewayMessageCreateDispatchData[]> {
		return new Promise((resolve, reject) => {
			const collected: GatewayMessageCreateDispatchData[] = [];
			let timeoutId: NodeJS.Timeout;

			const messageHandler = (msg: GatewayMessageCreateDispatchData) => {
				if (msg.channel_id !== channelId) return;
				if (!filter(msg)) return;

				collected.push(msg);

				if (collected.length >= max) {
					cleanup();
					resolve(collected);
				}
			};

			const cleanup = () => {
				this.off('rawMessageCreate', messageHandler);
				if (timeoutId) clearTimeout(timeoutId);
			};

			timeoutId = setTimeout(() => {
				cleanup();
				if (errors.includes('time')) {
					reject(new Error('Time limit exceeded'));
				} else {
					resolve(collected);
				}
			}, time);

			this.on('rawMessageCreate', messageHandler);
		});
	}

	async emitUserLog(log: IUserLog & { user_id: string }): Promise<void> {
		try {
			const channelId = 'channel_id' in log && log.channel_id ? BigInt(log.channel_id) : null;
			const guildId = 'guild_id' in log && log.guild_id ? BigInt(log.guild_id) : null;
			const messageId = 'message_id' in log && log.message_id ? BigInt(log.message_id) : null;

			await prisma.userLog.create({
				data: {
					user_id: BigInt(log.user_id),
					type: log.type,
					channel_id: channelId,
					guild_id: guildId,
					message_id: messageId,
					data: omit(log, ['user_id', 'type', 'channel_id', 'guild_id', 'message_id'])
				}
			});
		} catch (err) {
			Logging.logError(err as Error);
		}
	}
}
