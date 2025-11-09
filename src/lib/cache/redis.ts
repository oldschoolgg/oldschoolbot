import { execSync } from 'node:child_process';
import {
	type IChannel,
	type IEmoji,
	type IGuild,
	type IMember,
	type IRole,
	ZEmoji,
	ZMember,
	ZRole
} from '@oldschoolgg/schemas';
import { Time } from '@oldschoolgg/toolkit';
import { Redis } from 'ioredis';
import type { z } from 'zod';

import { MockedRedis } from '@/lib/cache/redis-mock.js';
import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { fetchUsernameAndCache } from '@/lib/util.js';

export enum CacheKeyPrefix {
	Member = 'member',
	Role = 'role',
	Emoji = 'emoji',
	RoboChimp = 'robochimp'
}

const fmkey = (...parts: string[]) => parts.join(':');

const Key = {
	Client: {
		DisabledCommands: (clientId: string) => fmkey('client', BOT_TYPE, clientId, 'disabled_commands')
	},
	User: {
		BadgedUsername: (userId: string) => fmkey('user', BOT_TYPE, userId, 'badged_username'),
		LockStatus: (userId: string) => fmkey('user', BOT_TYPE, userId, 'lock_status'),
		Ratelimit: (type: string, userId: string) => fmkey('user', BOT_TYPE, 'ratelimit', type, userId)
	},
	Guild: (id: string) => fmkey('guild', id),
	Member: (guildId: string, userId: string) => fmkey(CacheKeyPrefix.Member, guildId, userId),
	Emoji: (guildId: string, id: string) => fmkey(CacheKeyPrefix.Emoji, guildId, id),
	Role: (guildId: string, id: string) => fmkey(CacheKeyPrefix.Role, guildId, id),
	RoboChimpUser: (userId: string | bigint) => fmkey(CacheKeyPrefix.RoboChimp, 'user', userId.toString()),
	Channel: (channelId: string) => fmkey('channel', channelId)
};

type LockStatus = 'locked' | 'unlocked';

const TTL = {
	Minute: Time.Minute / Time.Second,
	Hour: Time.Hour / Time.Second,
	Day: Time.Day / Time.Second
};

const TTLS = {
	Guild: TTL.Hour * 24,
	Member: TTL.Hour * 23,
	Role: TTL.Hour * 100,
	RoboChimpUser: TTL.Hour * 4,
	Channel: TTL.Hour * 100
} as const;

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

class CacheManager {
	private client: Redis | MockedRedis;

	constructor() {
		if (globalConfig.isProduction) {
			this.client = new Redis();
		} else {
			try {
				const redis = new Redis({ reconnectOnError: () => false });
				redis.on('error', () => {
					redis.disconnect();
					this.client = new MockedRedis();
				});
				this.client = redis;
			} catch {
				this.client = new MockedRedis();
			}
		}
	}

	private async setString(key: string, value: string, ttlSeconds: number) {
		await this.client.set(key, value, 'EX', ttlSeconds);
	}

	private async setObject(key: string, value: object, ttlSeconds: number) {
		await this.setString(key, JSON.stringify(value), ttlSeconds);
	}

	private async getJson<T = unknown>(key: string): Promise<T | null> {
		const raw = await this.client.get(key);
		return raw ? JSON.parse(raw) : null;
	}

	private async getString(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	private async del(key: string) {
		await this.client.del(key);
	}

	private async bulkSet<T>(items: T[], getKey: (x: T) => string, schema: z.ZodType<T> | null, ttlSeconds: number) {
		const pipeline = this.client.pipeline();
		for (const item of items) {
			if (schema) schema.parse(item);
			const json = JSON.stringify(item);
			pipeline.set(getKey(item), json, 'EX', ttlSeconds);
		}
		await pipeline.exec();
	}

	private async getRawDatabaseGuild(id: string) {
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
		const key = Key.Guild(guildId);
		const cached = await this.getJson<IGuild>(key);
		if (cached) return cached;

		const guildSettings = await this.getRawDatabaseGuild(guildId);
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

		await this.setObject(Key.Guild(guildId), guild, TTLS.Guild);
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
		return this.setObject(Key.Guild(guildId), newGuild, TTLS.Guild);
	}

	async getMember(guildId: string, userId: string) {
		return this.getJson<IMember>(Key.Member(guildId, userId));
	}

	async getChannel(channelId: string): Promise<IChannel> {
		const key = Key.Channel(channelId);
		const cached = await this.getJson<IChannel>(key);
		if (cached) return cached;

		const rawChannel = await globalClient.fetchChannel(channelId);
		if (!rawChannel) throw new Error(`Tried to fetch non existent channel ${channelId}`);

		const channel: IChannel = {
			id: rawChannel.id,
			type: rawChannel.type,
			guild_id: 'guild_id' in rawChannel && rawChannel.guild_id ? rawChannel.guild_id : null
		};

		await this.setObject(key, channel, TTLS.Channel);
		return channel;
	}

	async getMainServerMember(userId: string) {
		return this.getJson<IMember>(Key.Member(globalConfig.supportServerID, userId));
	}

	async setMember(member: IMember) {
		ZMember.parse(member);
		await this.setObject(Key.Member(member.guild_id, member.user_id), member, TTLS.Member);
	}

	async bulkSetMembers(members: IMember[]) {
		await this.bulkSet(members, m => Key.Member(m.guild_id, m.user_id), ZMember, TTLS.Member);
	}

	async bulkSetEmojis(emojis: IEmoji[]) {
		await this.bulkSet(emojis, e => Key.Emoji(e.guild_id, e.id), ZEmoji, TTLS.Guild);
	}

	async getRole(guildId: string, roleId: string) {
		return this.getJson<IRole>(Key.Role(guildId, roleId));
	}

	async setRole(role: IRole) {
		ZRole.parse(role);
		await this.setObject(Key.Role(role.guild_id, role.id), role, TTLS.Role);
	}

	async bulkSetRoles(roles: IRole[]) {
		await this.bulkSet(roles, r => Key.Role(r.guild_id, r.id), ZRole, TTLS.Role);
	}

	async deleteGuild(id: string) {
		await this.del(Key.Guild(id));
	}

	async setRoboChimpUser(data: RobochimpUser) {
		await this.setObject(Key.RoboChimpUser(data.id), data, TTLS.RoboChimpUser);
	}

	async getRoboChimpUser(userId: string) {
		return this.getJson<RobochimpUser>(Key.RoboChimpUser(userId));
	}

	async bulkSetRoboChimpUser(users: RobochimpUser[]) {
		await this.bulkSet(users, u => Key.RoboChimpUser(u.id), null, TTLS.RoboChimpUser);
	}

	// Users
	async getUserLockStatus(userId: string): Promise<LockStatus> {
		const status = await this.getString(Key.User.LockStatus(userId));
		return (status as LockStatus | null) ?? 'unlocked';
	}

	async setUserLockStatus(userId: string, newStatus: LockStatus): Promise<void> {
		const current = await this.getUserLockStatus(userId);
		if (current === newStatus) {
			throw new Error(`User is already ${newStatus}`);
		}
		await this.setString(Key.User.LockStatus(userId), newStatus, 25);
	}

	async _getBadgedUsernameRaw(userId: string): Promise<string | null> {
		return this.getString(Key.User.BadgedUsername(userId));
	}

	async getBadgedUsername(userId: string) {
		return fetchUsernameAndCache(userId);
	}

	async getBadgedUsernames(userIds: string[]): Promise<string[]> {
		const result = await Promise.all(userIds.map(id => this.getBadgedUsername(id)));
		return result;
	}

	async setBadgedUsername(userId: string, badgedUsername: string) {
		await this.setString(Key.User.BadgedUsername(userId), badgedUsername, Time.Hour * 12);
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
		const fullKey = Key.User.Ratelimit(inputKey, userId);
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
		const ttl = await this.client.ttl(Key.User.Ratelimit(type, userId));
		return ttl < 0 ? 0 : ttl;
	}

	public async resetRatelimit(userId: string, type: RatelimitType): Promise<void> {
		await this.client.del(Key.User.Ratelimit(type, userId));
	}

	// Client
	async getDisabledCommands(): Promise<string[]> {
		const res = (await this.getJson<string[]>(Key.Client.DisabledCommands(globalClient.applicationId))) ?? [];
		return res;
	}

	async setDisabledCommands(newDisabledCommands: string[]): Promise<void> {
		const res = await this.setObject(
			Key.Client.DisabledCommands(globalClient.applicationId),
			newDisabledCommands,
			TTL.Hour * 4
		);
		return res;
	}

	async close() {
		await this.client.quit();
	}
}

global.Cache = new CacheManager();

declare global {
	var Cache: CacheManager;
}
