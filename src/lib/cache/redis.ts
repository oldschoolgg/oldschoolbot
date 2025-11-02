import {
	type IChannel,
	type IEmoji,
	type IGuild,
	type IMember,
	type IRole,
	ZEmoji,
	ZGuild,
	ZMember,
	ZRole
} from '@oldschoolgg/schemas';
import { Time } from '@oldschoolgg/toolkit';
import { Redis } from 'ioredis';
import type { z } from 'zod';

import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { fetchUsernameAndCache } from '@/lib/util.js';

export enum CacheKeyPrefix {
	Guild = 'guild',
	Member = 'member',
	Role = 'role',
	Emoji = 'emoji',
	RoboChimp = 'robochimp'
}

const fmkey = (...parts: string[]) => parts.join(':');

const Key = {
	User: {
		BadgedUsername: (userId: string) => fmkey('user', BOT_TYPE, userId, 'badged_username')
	},
	Guild: (id: string) => fmkey(CacheKeyPrefix.Guild, id),
	Member: (guildId: string, userId: string) => fmkey(CacheKeyPrefix.Member, guildId, userId),
	Emoji: (guildId: string, id: string) => fmkey(CacheKeyPrefix.Emoji, guildId, id),
	Role: (guildId: string, id: string) => fmkey(CacheKeyPrefix.Role, guildId, id),
	RoboChimpUser: (userId: string | bigint) => fmkey(CacheKeyPrefix.RoboChimp, 'user', userId.toString()),
	Channel: {
		GuildChannel: (guildId: string, channelId: string) => fmkey('channel', guildId, channelId),
		DMChannel: (userId: string, channelId: string) => fmkey('channel', userId, channelId)
	}
};

const TTLS = {
	Guild: Time.Hour * 24,
	Member: Time.Hour * 23,
	Role: Time.Hour * 100,
	RoboChimpUser: Time.Hour * 4,
	Channel: Time.Hour * 100
} as const;

export class CacheManager {
	private client: Redis;
	constructor() {
		this.client = new Redis();
	}

	private async setString(key: string, value: string, ttlSeconds: number) {
		await this.client.set(key, value, 'EX', ttlSeconds);
	}

	private async setObject(key: string, value: object, ttlSeconds: number) {
		await this.setString(key, JSON.stringify(value), ttlSeconds);
	}

	private async get<T>(key: string): Promise<T | null> {
		const raw = await this.client.get(key);
		return raw ? JSON.parse(raw) : null;
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

	async getGuild(id: string): Promise<IGuild> {
		const key = Key.Guild(id);
		const cached = await this.get<IGuild>(key);
		if (cached) return cached;
		const guild = await globalClient.fetchGuild(id);
		if (!guild) throw new Error(`Tried to fetch non existent guild ${id}`);
		await this.setGuild(guild);
		return guild;
	}

	private async setGuild(guild: IGuild) {
		ZGuild.parse(guild);
		await this.setObject(Key.Guild(guild.id), guild, TTLS.Guild);
	}

	async getMember(guildId: string, userId: string) {
		return this.get<IMember>(Key.Member(guildId, userId));
	}

	async getGuildChannel(guildId: string, channelId: string): Promise<IChannel> {
		const key = Key.Channel.GuildChannel(guildId, channelId);
		const cached = await this.get<IChannel>(key);
		if (cached) return cached;
		const channel = await globalClient.fetchChannel(channelId);
		if (!channel) throw new Error(`Tried to fetch non existent channel ${channelId} from guild ${guildId}`);
		await this.setObject(key, channel, TTLS.Channel);
		return channel;
	}

	async getDMChannel(userId: string, channelId: string): Promise<IChannel> {
		const key = Key.Channel.DMChannel(userId, channelId);
		const cached = await this.get<IChannel>(key);
		if (cached) return cached;
		const channel = await globalClient.fetchChannel(channelId);
		if (!channel) throw new Error(`Tried to fetch non existent dm channel ${channelId} for user ${userId}`);
		await this.setObject(key, channel, TTLS.Channel);
		return channel;
	}

	async getMainServerMember(userId: string) {
		return this.get<IMember>(Key.Member(globalConfig.supportServerID, userId));
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
		return this.get(Key.Role(guildId, roleId));
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
		return this.get<RobochimpUser>(Key.RoboChimpUser(userId));
	}

	async bulkSetRoboChimpUser(users: RobochimpUser[]) {
		await this.bulkSet(users, u => Key.RoboChimpUser(u.id), null, TTLS.RoboChimpUser);
	}

	async _getBadgedUsernameRaw(userId: string): Promise<string | null> {
		return this.get<string>(Key.User.BadgedUsername(userId));
	}

	async getBadgedUsername(userId: string) {
		return fetchUsernameAndCache(userId);
	}

	async setBadgedUsername(userId: string, badgedUsername: string) {
		await this.setString(Key.User.BadgedUsername(userId), badgedUsername, Time.Hour * 12);
	}

	async close() {
		await this.client.quit();
	}
}

global.Cache = new CacheManager();
declare global {
	var Cache: CacheManager;
}
