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
import { Time } from '@oldschoolgg/toolkit';
import { RedisKeys } from '@oldschoolgg/util';
import { Redis } from 'ioredis';

import type { Guild } from '@/prisma/main.js';
import { MockedRedis } from '@/lib/cache/redis-mock.js';
import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { fetchUsernameAndCache } from '@/lib/util.js';

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

type RatelimitType = 'random_events' | 'global_buttons' | 'stats_command';

const RATELIMITS: Record<RatelimitType, RatelimitConfig> = {
	global_buttons: { windowSeconds: 2, max: 1 },
	random_events: { windowSeconds: TTL.Hour * 3, max: 5 },
	stats_command: { windowSeconds: 5, max: 1 }
} as const;

const BotKeys = RedisKeys[BOT_TYPE];

class CacheManager {
	private client: Redis;

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

	private async getGuildSettings(id: string): Promise<Guild | null> {
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
		const key = BotKeys.GuildSettings(guildId);
		const cached = await this.getJson<IGuild>(key);
		if (cached) return cached;

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

	public async updateGuild(guildId: string, updates: Partial<IGuild>) {
		const guildSettings = await prisma.guild.upsert({
			where: { id: guildId },
			create: {
				id: guildId,
				disabledCommands: updates.disabled_commands ?? undefined,
				petchannel: updates.petchannel ?? undefined,
				staffOnlyChannels: updates.staff_only_channels ?? undefined
			},
			update: {
				disabledCommands: updates.disabled_commands ?? undefined,
				petchannel: updates.petchannel ?? undefined,
				staffOnlyChannels: updates.staff_only_channels ?? undefined
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

	async getMember(guildId: string, userId: string) {
		return this.getJson<IMember>(RedisKeys.Discord.Member(guildId, userId));
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

	async _getBadgedUsernameRaw(userId: string): Promise<string | null> {
		return this.client.get(BotKeys.User.BadgedUsername(userId));
	}

	async getBadgedUsername(userId: string) {
		return fetchUsernameAndCache(userId);
	}

	async getBadgedUsernames(userIds: string[]): Promise<string[]> {
		const result = await Promise.all(userIds.map(id => this.getBadgedUsername(id)));
		return result;
	}

	async setBadgedUsername(userId: string, badgedUsername: string): Promise<void> {
		await this.client.set(BotKeys.User.BadgedUsername(userId), badgedUsername);
	}

	private async doRatelimitCheck({
		userId,
		key: inputKey,
		windowSeconds,
		max
	}: {
		userId: string;
		key: string;
		windowSeconds: number;
		max: number;
	}): Promise<{ success: true } | { success: false; timeRemainingMs: number }> {
		const fullKey = BotKeys.User.Ratelimit(inputKey, userId);
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
		return this.doRatelimitCheck({
			userId,
			key: type,
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
