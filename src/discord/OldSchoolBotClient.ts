import { WebSocketShardEvents, WebSocketShardStatus } from '@discordjs/ws';
import {
	type APIApplication,
	type APIUser,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	collectSingleInteraction,
	DiscordClient,
	type DiscordClientOptions,
	type GatewayMessageCreateDispatchData,
	Routes
} from '@oldschoolgg/discord';
import type { IChannel, IUserLog, IWebhook } from '@oldschoolgg/schemas';
import { Time } from '@oldschoolgg/toolkit';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { omit } from 'remeda';

import { makeParty } from '@/discord/interaction/makeParty.js';
import { mentionCommand } from '@/discord/utils.js';
import { DISCORD_USER_IDS_INSERTED_CACHE } from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends DiscordClient {
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;
	private shardStats = new Map<
		number,
		{
			latencies: number[];
			lastHeartbeatAt?: number;
			lastAckAt?: number;
			lastCloseCode?: number;
			lastResumeAt?: number;
			lastReadyAt?: number;
			lastError?: string;
		}
	>();

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
		this.ws.on(WebSocketShardEvents.HeartbeatComplete, (stats, shardId) => {
			const existing = this.getShardStatsEntry(shardId);
			existing.lastHeartbeatAt = stats.heartbeatAt;
			existing.lastAckAt = stats.ackAt;
			existing.latencies.push(stats.latency);
			if (existing.latencies.length > 12) existing.latencies.shift();
		});
		this.ws.on(WebSocketShardEvents.Closed, (code, shardId) => {
			this.getShardStatsEntry(shardId).lastCloseCode = code;
		});
		this.ws.on(WebSocketShardEvents.Resumed, shardId => {
			this.getShardStatsEntry(shardId).lastResumeAt = Date.now();
		});
		this.ws.on(WebSocketShardEvents.Ready, (_data, shardId) => {
			this.getShardStatsEntry(shardId).lastReadyAt = Date.now();
		});
		this.ws.on(WebSocketShardEvents.Error, (err, shardId) => {
			this.getShardStatsEntry(shardId).lastError = err.message;
		});
		this.ws.on(WebSocketShardEvents.SocketError, (err, shardId) => {
			this.getShardStatsEntry(shardId).lastError = err.message;
		});
	}

	private getShardStatsEntry(shardId: number) {
		let entry = this.shardStats.get(shardId);
		if (!entry) {
			entry = { latencies: [] };
			this.shardStats.set(shardId, entry);
		}
		return entry;
	}

	private calcShardHealth(status: WebSocketShardStatus, shardId: number) {
		const stats = this.shardStats.get(shardId);
		const avgLatency =
			stats && stats.latencies.length > 0
				? Math.round(stats.latencies.reduce((sum, val) => sum + val, 0) / stats.latencies.length)
				: null;
		const lastLatency = stats?.latencies.at(-1) ?? null;
		const staleHeartbeat = stats?.lastAckAt ? Date.now() - stats.lastAckAt > Time.Minute * 2 : true;
		const isDead = status !== WebSocketShardStatus.Ready;
		const isLagged =
			(avgLatency !== null && avgLatency >= 10_000) || (lastLatency !== null && lastLatency >= 15_000);
		const isUnhealthy = isDead || staleHeartbeat || isLagged;
		return {
			label: isDead ? 'dead' : isUnhealthy ? 'unhealthy' : 'healthy',
			isDead,
			isUnhealthy,
			avgLatency,
			lastLatency,
			staleHeartbeat
		};
	}

	async getShardStatusReport() {
		const statuses = await this.ws.fetchStatus();
		return [...statuses.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([shardId, status]) => ({
				shardId,
				status,
				statusName: WebSocketShardStatus[status],
				health: this.calcShardHealth(status, shardId),
				stats: this.shardStats.get(shardId)
			}));
	}

	async restartShards(which: 'all' | 'dead' | 'unhealthy') {
		const strategy = (this.ws as any).strategy;
		if (typeof strategy?.restartShard !== 'function') {
			throw new Error('Shard restart strategy is unavailable.');
		}
		const report = await this.getShardStatusReport();
		const targetShardIds = report
			.filter(entry => {
				if (which === 'all') return true;
				if (which === 'dead') return entry.health.isDead;
				return entry.health.isUnhealthy;
			})
			.map(entry => entry.shardId);
		for (const shardId of targetShardIds) {
			await strategy.restartShard(shardId);
		}
		return targetShardIds;
	}

	async restartShardByID(shardId: number) {
		const strategy = (this.ws as any).strategy;
		if (typeof strategy?.restartShard !== 'function') {
			throw new Error('Shard restart strategy is unavailable.');
		}
		const report = await this.getShardStatusReport();
		const exists = report.some(entry => entry.shardId === shardId);
		if (!exists) return null;
		await strategy.restartShard(shardId);
		return shardId;
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
		await Promise.all([Cache.clearWebhook(channelId), prisma.webhook.delete({ where: { channel_id: channelId } })]);
	}

	private async getChannelWebhook(channelId: string): Promise<IWebhook | null> {
		const cachedWebhook = await Cache.getWebhook(channelId);
		if (cachedWebhook) return cachedWebhook;
		const existingWebhooks = await globalClient.fetchWebhooks(channelId);
		if (existingWebhooks.length === 0) return null;
		const existingWebhook = existingWebhooks[0];
		const existingWebhookFmt: IWebhook = {
			id: existingWebhook.id,
			token: existingWebhook.token!,
			channel_id: channelId
		};
		await Cache.setWebhook(existingWebhookFmt);
		return existingWebhookFmt;
	}

	private async sendToWebhook(channelId: string, data: SendableMessage): Promise<{ success: boolean }> {
		try {
			const webhook = await this.getChannelWebhook(channelId);
			if (!webhook) return { success: false };
			await globalClient.sendWebhook(webhook, data);
			return { success: true };
		} catch (_err: unknown) {
			const err = _err as Error;
			if (err.message?.includes('Unknown Webhook')) {
				Logging.logDebug(`Deleting unknown webhook in ${channelId}`);
				await this.deleteWebhook(channelId);
			} else {
				Logging.logError(err);
			}
			return { success: false };
		}
	}

	async sendMessageOrWebhook(channelId: string, rawMessage: SendableMessage): Promise<void> {
		try {
			await this.sendMessage(channelId, rawMessage);
		} catch {
			await this.sendToWebhook(channelId, rawMessage);
		}
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
