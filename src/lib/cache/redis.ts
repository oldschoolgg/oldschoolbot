import type { MegaDuckLocation } from '@/lib/bso/megaDuck.js';

import {
	type IChannel,
	type IEmoji,
	type IGuild,
	type IMember,
	type IRole,
	type IWebhook,
	ZMember,
	ZRole
} from '@oldschoolgg/schemas';
import { cleanUsername, Time } from '@oldschoolgg/toolkit';
import { isValidDiscordSnowflake, MockedRedis, RedisKeys } from '@oldschoolgg/util';
import { Redis } from 'ioredis';
import PQueue from 'p-queue';

import type { Guild, Prisma } from '@/prisma/main.js';
import { BitField, BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';

type LockStatus = 'locked' | 'unlocked';

const TTL = {
	Minute: Time.Minute / Time.Second,
	Hour: Time.Hour / Time.Second,
	Day: Time.Day / Time.Second
};

type RatelimitConfig = {
	windowSeconds: number;
	max: number;
};

type DiscordUserFetchQueueStats = {
	queued: number;
	running: number;
	totalQueued: number;
	totalStarted: number;
	totalCompleted: number;
	totalFailed: number;
	totalFetchRequests: number;
	dedupeSkips: number;
	currentUserId: string | null;
	lastQueuedAt: Date | null;
	lastStartedAt: Date | null;
	lastCompletedAt: Date | null;
	lastFailedAt: Date | null;
	lastError: string | null;
	queuedUserIds: string[];
};

type StoredDiscordUserFetchQueueStats = Omit<
	DiscordUserFetchQueueStats,
	'lastQueuedAt' | 'lastStartedAt' | 'lastCompletedAt' | 'lastFailedAt'
> & {
	lastQueuedAt: string | null;
	lastStartedAt: string | null;
	lastCompletedAt: string | null;
	lastFailedAt: string | null;
};

type DiscordUserFetchQueueStatsFields = Record<keyof StoredDiscordUserFetchQueueStats, string>;

function createDefaultDiscordUserFetchQueueStats(): DiscordUserFetchQueueStats {
	return {
		queued: 0,
		running: 0,
		totalQueued: 0,
		totalStarted: 0,
		totalCompleted: 0,
		totalFailed: 0,
		totalFetchRequests: 0,
		dedupeSkips: 0,
		currentUserId: null,
		lastQueuedAt: null,
		lastStartedAt: null,
		lastCompletedAt: null,
		lastFailedAt: null,
		lastError: null,
		queuedUserIds: []
	};
}

function parseNullableDate(value: string | Date | null | undefined): Date | null {
	if (!value) return null;
	if (value instanceof Date) return value;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseStatsNumber(value: string | number | null | undefined): number {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function parseQueuedUserIds(value: string | string[] | null | undefined): string[] {
	if (Array.isArray(value)) return value;
	if (!value) return [];
	try {
		const parsed = JSON.parse(value) as unknown;
		return Array.isArray(parsed) ? parsed.filter((userId): userId is string => typeof userId === 'string') : [];
	} catch {
		return [];
	}
}

type RatelimitType =
	| 'random_events'
	| 'global_buttons'
	| 'stats_command'
	| 'delay_member_fetch'
	| 'delay_guild_fetch'
	| 'delay_robochimp_fetch';

const RATELIMITS: Record<RatelimitType, RatelimitConfig> = {
	global_buttons: { windowSeconds: 2, max: 1 },
	random_events: { windowSeconds: TTL.Hour * 3, max: 5 },
	stats_command: { windowSeconds: 5, max: 1 },
	delay_member_fetch: { windowSeconds: 5 * 60, max: 1 },
	delay_guild_fetch: { windowSeconds: 5 * 60, max: 1 },
	delay_robochimp_fetch: { windowSeconds: 5 * 60, max: 1 }
} as const;

const BotKeys = RedisKeys[BOT_TYPE];
type CachedGuildSettings = Pick<Guild, 'id' | 'disabledCommands' | 'petchannel' | 'staffOnlyChannels'>;
type GuildUpdateInput = Partial<IGuild> & {
	mega_duck_location?: MegaDuckLocation | Prisma.InputJsonValue;
};

class CacheManager {
	private client: Redis;
	private discordUserFetchQueueStatsInit: Promise<void>;
	private discordUserFetchQueue = new PQueue({
		concurrency: 1,
		intervalCap: 1,
		interval: Time.Second
	});
	private queuedDiscordUserFetches = new Set<string>();
	private discordUserFetchQueueStats = createDefaultDiscordUserFetchQueueStats();

	constructor() {
		if (globalConfig.isProduction) {
			this.client = new Redis();
		} else {
			try {
				const redis = new Redis({ reconnectOnError: () => false });
				redis.on('error', () => {
					redis.disconnect();
					this.client = new MockedRedis() as any as Redis;
				});
				this.client = redis;
			} catch {
				this.client = new MockedRedis() as any as Redis;
			}
		}
		this.discordUserFetchQueueStatsInit = this.initializeDiscordUserFetchQueueStats();
	}

	private async setString(key: string, value: string, ttlSeconds: number) {
		await this.client.set(key, value, 'EX', ttlSeconds);
	}

	private async setJson(key: string, value: object) {
		await this.client.set(key, JSON.stringify(value));
	}

	private async getJson<T = unknown>(key: string): Promise<T | null> {
		const raw = await this.client.get(key);
		return raw ? JSON.parse(raw) : null;
	}

	private async getString(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	private async bulkSet<T>(items: T[], getKey: (x: T) => string): Promise<void> {
		const pipeline = this.client.pipeline();
		for (const item of items) {
			const json = JSON.stringify(item);
			pipeline.set(getKey(item), json);
		}
		await pipeline.exec();
	}

	private async getGuildSettings(id: string): Promise<CachedGuildSettings | null> {
		const guildSettings = await prisma.guild.findUnique({
			where: { id },
			select: {
				id: true,
				disabledCommands: true,
				petchannel: true,
				staffOnlyChannels: true
			}
		});
		return guildSettings;
	}

	async getGuild(guildId: string): Promise<IGuild> {
		const delayCheck = await this.tryRatelimit(guildId, 'delay_guild_fetch');
		if (!delayCheck.success) {
			// If we're under time out, it could be assumed to be cached, but...
			const cacheGuild = await this.getJson<IGuild>(BotKeys.GuildSettings(guildId));
			if (cacheGuild) {
				return cacheGuild;
			}
		}

		const guildSettings = await this.getGuildSettings(guildId);
		const guild: IGuild = guildSettings
			? {
					id: guildSettings.id,
					disabled_commands: guildSettings.disabledCommands,
					petchannel: guildSettings.petchannel,
					staff_only_channels: guildSettings.staffOnlyChannels
				}
			: {
					id: guildId,
					disabled_commands: [],
					petchannel: null,
					staff_only_channels: []
				};

		await this.setJson(BotKeys.GuildSettings(guild.id), guild);
		return guild;
	}

	public async updateGuild(guildId: string, updates: GuildUpdateInput) {
		const guildSettings = await prisma.guild.upsert({
			where: { id: guildId },
			create: {
				id: guildId,
				disabledCommands: updates.disabled_commands ?? undefined,
				petchannel: updates.petchannel ?? undefined,
				staffOnlyChannels: updates.staff_only_channels ?? undefined,
				mega_duck_location: updates.mega_duck_location as Prisma.InputJsonValue | undefined
			},
			update: {
				disabledCommands: updates.disabled_commands ?? undefined,
				petchannel: updates.petchannel ?? undefined,
				staffOnlyChannels: updates.staff_only_channels ?? undefined,
				mega_duck_location: updates.mega_duck_location as Prisma.InputJsonValue | undefined
			}
		});

		const newGuild: IGuild = {
			id: guildSettings.id,
			disabled_commands: guildSettings.disabledCommands,
			petchannel: guildSettings.petchannel,
			staff_only_channels: guildSettings.staffOnlyChannels
		};
		return this.setJson(BotKeys.GuildSettings(guildId), newGuild);
	}

	// We will only try to getMember's when guildId == SupportServerID, UNLESS forceFetch is true, in which case we will always fetch.
	async getMember({
		guildId,
		userId,
		cacheOnly,
		refreshCache,
		externalServer
	}: {
		guildId: string;
		userId: string;
		cacheOnly?: boolean;
		refreshCache?: boolean;
		externalServer?: boolean;
	}): Promise<IMember | null> {
		// If we cache this guild, lets check it
		const cachedServer = globalConfig.guildIdsToCache.includes(guildId);
		if (cachedServer) {
			const key = `${guildId}:${userId}`;
			if (refreshCache) return await globalClient.fetchMember({ guildId, userId });
			const delayCheck = await Cache.tryRatelimit(key, 'delay_member_fetch');
			if (cacheOnly || !delayCheck.success) {
				// If we're under time out, it could be assumed to be cached, but...
				const cacheMember = await this.getJson<IMember>(RedisKeys.Discord.Member(guildId, userId));
				if (cacheMember) {
					return cacheMember;
				} else {
					if (cacheOnly) return null;
					const member = await globalClient.fetchMember({ guildId, userId });
					await Cache.setMember(member);
					return member;
				}
			}
		}
		if (cachedServer || externalServer) {
			// We can fetch now
			return await globalClient.fetchMember({ guildId, userId });
		}
		return null;
	}

	async getChannel(channelId: string): Promise<IChannel> {
		const key = RedisKeys.Discord.Channel(channelId);
		const cached = await this.getJson<IChannel>(key);
		if (cached) return cached;

		const rawChannel = await globalClient.fetchChannel(channelId);
		if (!rawChannel) throw new Error(`Tried to fetch non existent channel ${channelId}`);

		const channel: IChannel = {
			id: rawChannel.id,
			type: rawChannel.type,
			guild_id: 'guild_id' in rawChannel && rawChannel.guild_id ? rawChannel.guild_id : null
		};

		await this.client.set(key, JSON.stringify(channel));
		return channel;
	}

	async getMainServerMember(userId: string) {
		return this.getJson<IMember>(RedisKeys.Discord.Member(globalConfig.supportServerID, userId));
	}

	async setMember(member: IMember): Promise<void> {
		ZMember.parse(member);
		await this.setJson(RedisKeys.Discord.Member(member.guild_id, member.user_id), member);
	}

	async bulkSetMembers(members: IMember[]): Promise<void> {
		await this.bulkSet(members, m => RedisKeys.Discord.Member(m.guild_id, m.user_id));
	}

	async bulkSetEmojis(emojis: IEmoji[]): Promise<void> {
		await this.bulkSet(emojis, e => RedisKeys.Discord.Emoji(e.guild_id, e.id));
	}

	async getRole(guildId: string, roleId: string) {
		return this.getJson<IRole>(RedisKeys.Discord.Role(guildId, roleId));
	}

	async setRole(role: IRole) {
		ZRole.parse(role);
		await this.setJson(RedisKeys.Discord.Role(role.guild_id, role.id), role);
	}

	async bulkSetRoles(roles: IRole[]) {
		await this.bulkSet(roles, r => RedisKeys.Discord.Role(r.guild_id, r.id));
	}

	async setRoboChimpUser(userID: string, user: RobochimpUser): Promise<void> {
		await this.setJson(RedisKeys.RoboChimpUser(BigInt(userID)), user);
	}
	async getRoboChimpUser(userId: string): Promise<RobochimpUser | null> {
		return this.getJson<RobochimpUser>(RedisKeys.RoboChimpUser(BigInt(userId)));
	}

	// Users
	async getUserLockStatus(userId: string): Promise<LockStatus> {
		const status = await this.getString(BotKeys.User.LockStatus(userId));
		return (status as LockStatus | null) ?? 'unlocked';
	}

	async setUserLockStatus(userId: string, newStatus: LockStatus): Promise<void> {
		const current = await this.getUserLockStatus(userId);
		if (current === newStatus) {
			throw new Error(`User is already ${newStatus}`);
		}
		await this.setString(BotKeys.User.LockStatus(userId), newStatus, 25);
	}

	private async getExpiringString(fullKey: string): Promise<string | null> {
		const ttl = await this.client.pttl(fullKey);
		if (ttl === -2) {
			return null;
		}
		if (ttl === -1) {
			const delaySeconds = Math.floor(Math.random() * TTL.Hour);
			if (delaySeconds <= TTL.Minute) {
				await this.client.del(fullKey);
				return null;
			}
			await this.client.pexpire(fullKey, delaySeconds * 1000);
		}
		return this.client.get(fullKey);
	}

	private async setExpiringString(fullKey: string, value: string): Promise<void> {
		const jitterSeconds = Math.floor(Math.random() * TTL.Hour * 2) - TTL.Hour;
		await this.setString(fullKey, value, TTL.Day + jitterSeconds);
	}

	private getDiscordUserFetchQueueStatsSnapshot(): DiscordUserFetchQueueStats {
		return {
			...this.discordUserFetchQueueStats,
			queued: this.discordUserFetchQueue.size,
			running: this.discordUserFetchQueue.pending,
			queuedUserIds: [...this.queuedDiscordUserFetches]
		};
	}

	private serializeDiscordUserFetchQueueStats(): StoredDiscordUserFetchQueueStats {
		const stats = this.getDiscordUserFetchQueueStatsSnapshot();
		return {
			...stats,
			lastQueuedAt: stats.lastQueuedAt?.toISOString() ?? null,
			lastStartedAt: stats.lastStartedAt?.toISOString() ?? null,
			lastCompletedAt: stats.lastCompletedAt?.toISOString() ?? null,
			lastFailedAt: stats.lastFailedAt?.toISOString() ?? null
		};
	}

	private serializeDiscordUserFetchQueueStatsFields(): DiscordUserFetchQueueStatsFields {
		const stats = this.serializeDiscordUserFetchQueueStats();
		return {
			queued: stats.queued.toString(),
			running: stats.running.toString(),
			totalQueued: stats.totalQueued.toString(),
			totalStarted: stats.totalStarted.toString(),
			totalCompleted: stats.totalCompleted.toString(),
			totalFailed: stats.totalFailed.toString(),
			totalFetchRequests: stats.totalFetchRequests.toString(),
			dedupeSkips: stats.dedupeSkips.toString(),
			currentUserId: stats.currentUserId ?? '',
			lastQueuedAt: stats.lastQueuedAt ?? '',
			lastStartedAt: stats.lastStartedAt ?? '',
			lastCompletedAt: stats.lastCompletedAt ?? '',
			lastFailedAt: stats.lastFailedAt ?? '',
			lastError: stats.lastError ?? '',
			queuedUserIds: JSON.stringify(stats.queuedUserIds)
		};
	}

	private async persistDiscordUserFetchQueueStats(): Promise<void> {
		await this.client.hset(RedisKeys.Discord.UserFetchQueueStats, this.serializeDiscordUserFetchQueueStatsFields());
	}

	private parseDiscordUserFetchQueueStatsFields(
		fields: Partial<DiscordUserFetchQueueStatsFields>
	): Partial<DiscordUserFetchQueueStats> {
		return {
			queued: parseStatsNumber(fields.queued),
			running: parseStatsNumber(fields.running),
			totalQueued: parseStatsNumber(fields.totalQueued),
			totalStarted: parseStatsNumber(fields.totalStarted),
			totalCompleted: parseStatsNumber(fields.totalCompleted),
			totalFailed: parseStatsNumber(fields.totalFailed),
			totalFetchRequests: parseStatsNumber(fields.totalFetchRequests),
			dedupeSkips: parseStatsNumber(fields.dedupeSkips),
			currentUserId: fields.currentUserId || null,
			lastQueuedAt: parseNullableDate(fields.lastQueuedAt),
			lastStartedAt: parseNullableDate(fields.lastStartedAt),
			lastCompletedAt: parseNullableDate(fields.lastCompletedAt),
			lastFailedAt: parseNullableDate(fields.lastFailedAt),
			lastError: fields.lastError || null,
			queuedUserIds: parseQueuedUserIds(fields.queuedUserIds)
		};
	}

	private async fetchDiscordUserFetchQueueStatsFields(): Promise<Partial<DiscordUserFetchQueueStats>> {
		try {
			const fields = await this.client.hgetall(RedisKeys.Discord.UserFetchQueueStats);
			return this.parseDiscordUserFetchQueueStatsFields(fields as Partial<DiscordUserFetchQueueStatsFields>);
		} catch (err) {
			if (!(err instanceof Error) || !err.message.includes('WRONGTYPE')) {
				throw err;
			}

			const legacyJson = await this.getString(RedisKeys.Discord.UserFetchQueueStats).catch(() => null);
			await this.client.del(RedisKeys.Discord.UserFetchQueueStats);
			if (!legacyJson) return {};

			try {
				const legacy = JSON.parse(legacyJson) as Partial<StoredDiscordUserFetchQueueStats>;
				return {
					...legacy,
					lastQueuedAt: parseNullableDate(legacy.lastQueuedAt),
					lastStartedAt: parseNullableDate(legacy.lastStartedAt),
					lastCompletedAt: parseNullableDate(legacy.lastCompletedAt),
					lastFailedAt: parseNullableDate(legacy.lastFailedAt),
					queuedUserIds: parseQueuedUserIds(legacy.queuedUserIds)
				};
			} catch {
				return {};
			}
		}
	}

	private async initializeDiscordUserFetchQueueStats(): Promise<void> {
		const stored = await this.fetchDiscordUserFetchQueueStatsFields();
		this.discordUserFetchQueueStats = {
			...createDefaultDiscordUserFetchQueueStats(),
			...stored,
			queued: 0,
			running: 0,
			currentUserId: null,
			lastQueuedAt: parseNullableDate(stored.lastQueuedAt),
			lastStartedAt: parseNullableDate(stored.lastStartedAt),
			lastCompletedAt: parseNullableDate(stored.lastCompletedAt),
			lastFailedAt: parseNullableDate(stored.lastFailedAt),
			queuedUserIds: []
		};
		await this.persistDiscordUserFetchQueueStats();
	}

	private async queueDiscordUserFetch(userId: string): Promise<void> {
		await this.discordUserFetchQueueStatsInit;
		if (this.queuedDiscordUserFetches.has(userId)) {
			this.discordUserFetchQueueStats.dedupeSkips++;
			await this.persistDiscordUserFetchQueueStats();
			return;
		}

		this.queuedDiscordUserFetches.add(userId);
		this.discordUserFetchQueueStats.totalQueued++;
		this.discordUserFetchQueueStats.lastQueuedAt = new Date();
		const task = this.discordUserFetchQueue.add(async () => {
			await this.discordUserFetchQueueStatsInit;
			this.discordUserFetchQueueStats.totalStarted++;
			this.discordUserFetchQueueStats.currentUserId = userId;
			this.discordUserFetchQueueStats.lastStartedAt = new Date();
			await this.persistDiscordUserFetchQueueStats();

			try {
				this.discordUserFetchQueueStats.totalFetchRequests++;
				await this.persistDiscordUserFetchQueueStats();
				const djsUser = await globalClient.fetchUser(userId).catch(() => null);
				const username = djsUser?.username ? cleanUsername(djsUser.username) : null;

				await prisma.user.upsert({
					where: {
						id: userId
					},
					create: {
						id: userId,
						username: username ?? undefined
					},
					update: username
						? {
								username
							}
						: {},
					select: {
						id: true
					}
				});

				if (username) {
					await this.setUsername(userId, username);
					await this.client.del(BotKeys.User.BadgedUsername(userId));
				}

				this.discordUserFetchQueueStats.totalCompleted++;
				this.discordUserFetchQueueStats.lastCompletedAt = new Date();
				await this.persistDiscordUserFetchQueueStats();
			} catch (err) {
				this.discordUserFetchQueueStats.totalFailed++;
				this.discordUserFetchQueueStats.lastFailedAt = new Date();
				this.discordUserFetchQueueStats.lastError = (err as Error).message;
				await this.persistDiscordUserFetchQueueStats();
				throw err;
			} finally {
				this.queuedDiscordUserFetches.delete(userId);
				if (this.discordUserFetchQueueStats.currentUserId === userId) {
					this.discordUserFetchQueueStats.currentUserId = null;
				}
				await this.persistDiscordUserFetchQueueStats();
			}
		});
		await this.persistDiscordUserFetchQueueStats();
		void task
			.catch(err => {
				Logging.logError(err as Error, {
					source: 'discord_user_fetch_queue',
					user_id: userId
				});
			})
			.finally(() => {
				void this.persistDiscordUserFetchQueueStats();
			});
	}

	async getDiscordUserFetchQueueStats(): Promise<DiscordUserFetchQueueStats> {
		await this.discordUserFetchQueueStatsInit;
		return this.getDiscordUserFetchQueueStatsSnapshot();
	}

	async getUsername(userId: string): Promise<string> {
		if (!isValidDiscordSnowflake(userId)) {
			throw new Error(`Invalid userID: ${userId}`);
		}

		const cached = await this.getExpiringString(RedisKeys.Discord.Username(userId));
		if (cached) return cached;

		await this.queueDiscordUserFetch(userId);
		const user = await prisma.user.findFirst({
			where: {
				id: userId
			},
			select: {
				username: true
			}
		});

		if (!user?.username) return 'Unknown';

		await this.setUsername(userId, user.username);
		return user.username;
	}

	async setUsername(userId: string, username: string): Promise<void> {
		await this.setExpiringString(RedisKeys.Discord.Username(userId), username);
	}

	async resetUsername(userId: string) {
		await this.client.del(RedisKeys.Discord.Username(userId));
		await this.client.del(BotKeys.User.BadgedUsername(userId));
	}
	async getBadgedUsername(userId: string): Promise<string> {
		if (!isValidDiscordSnowflake(userId)) {
			throw new Error(`Invalid userID: ${userId}`);
		}
		const key = BotKeys.User.BadgedUsername(userId);
		const cached = await this.getExpiringString(key);
		if (cached) return cached;

		const username = await this.getUsername(userId);
		const user = await prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				badges: true,
				bitfield: true,
				minion_ironman: true
			}
		});
		const badgesString = user
			? makeBadgeString(user.badges, user.minion_ironman, user.bitfield.includes(BitField.OriginalCyrSupporter))
			: '';
		const badgedUsername = `${badgesString} ${username}`.trim();
		if (username !== 'Unknown') {
			await this.setExpiringString(key, badgedUsername);
		}
		return badgedUsername;
	}

	async getBadgedUsernames(userIds: string[]): Promise<string[]> {
		return Promise.all(userIds.map(id => this.getBadgedUsername(id)));
	}

	public async fullKeyRatelimitCheck({
		key: fullKey,
		windowSeconds,
		max
	}: {
		key: string;
		windowSeconds: number;
		max: number;
	}): Promise<{ success: true } | { success: false; timeRemainingMs: number }> {
		const count = await this.client.incr(fullKey);

		if (count === 1) await this.client.expire(fullKey, windowSeconds);

		if (count <= max) return { success: true };

		let ttl = await this.client.pttl(fullKey);
		if (ttl < 0) {
			// no expiry for some reason; enforce one
			await this.client.pexpire(fullKey, windowSeconds * 1000);
			ttl = windowSeconds * 1000;
		}

		return { success: false, timeRemainingMs: ttl };
	}

	public async tryRatelimit(
		userId: string,
		type: RatelimitType
	): Promise<{ success: true } | { success: false; timeRemainingMs: number }> {
		const cfg = RATELIMITS[type];
		const key = BotKeys.User.Ratelimit(type, userId);
		return this.fullKeyRatelimitCheck({
			key,
			windowSeconds: cfg.windowSeconds,
			max: cfg.max
		});
	}

	public async getRatelimitTTL(userId: string, type: RatelimitType): Promise<number> {
		const ttl = await this.client.ttl(BotKeys.User.Ratelimit(type, userId));
		return ttl < 0 ? 0 : ttl;
	}

	public async resetRatelimit(userId: string, type: RatelimitType): Promise<void> {
		await this.client.del(BotKeys.User.Ratelimit(type, userId));
	}

	// Client
	async getDisabledCommands(): Promise<string[]> {
		const res = (await this.getJson<string[]>(BotKeys.DisabledCommands)) ?? [];
		return res;
	}

	async setDisabledCommands(newDisabledCommands: string[]): Promise<void> {
		await this.setJson(BotKeys.DisabledCommands, newDisabledCommands);
	}

	async isUserBlacklisted(id: string): Promise<boolean> {
		return (await this.client.sismember(RedisKeys.BlacklistedUsers, id)) === 1;
	}

	async isGuildBlacklisted(id: string): Promise<boolean> {
		return (await this.client.sismember(RedisKeys.BlacklistedGuilds, id)) === 1;
	}

	async getAllBlacklistedUsers(): Promise<Set<string>> {
		return new Set(await this.client.smembers(RedisKeys.BlacklistedUsers));
	}

	// Webhooks
	async clearWebhook(channelId: string): Promise<void> {
		await this.client.del(BotKeys.Webhook(channelId));
	}

	async setWebhook(webhook: IWebhook): Promise<void> {
		await this.setJson(BotKeys.Webhook(webhook.channel_id), webhook);
	}

	async getWebhook(channelId: string): Promise<IWebhook | null> {
		return this.getJson(BotKeys.Webhook(channelId));
	}

	async close() {
		await this.client.quit();
	}
}

global.Cache = new CacheManager();

declare global {
	var Cache: CacheManager;
}
