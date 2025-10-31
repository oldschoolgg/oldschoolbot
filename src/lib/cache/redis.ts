import {
	type IChannel,
	type IEmoji,
	type IGuild,
	type IMember,
	type IRole,
	ZChannel,
	ZEmoji,
	ZGuild,
	ZMember,
	ZRole
} from '@oldschoolgg/schemas';
import { Redis } from 'ioredis';
import type { z } from 'zod';

import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import { fetchUsernameAndCache } from '@/lib/util.js';

export enum CacheKeyPrefix {
	Guild = 'guild',
	Member = 'member',
	User = 'user',
	Channel = 'channel',
	Role = 'role',
	Emoji = 'emoji',
	RoboChimp = 'robochimp'
}

const fmkey = (...parts: string[]) => parts.join(':');

const Key = {
	User: {
		BadgedUsername: (userId: string) => fmkey(CacheKeyPrefix.User, BOT_TYPE, userId, 'badged_username')
	}
};

export class CacheManager {
	private client: Redis;
	constructor() {
		this.client = new Redis();
	}

	private async setString(key: string, value: string, ttlSeconds?: number) {
		if (ttlSeconds) await this.client.set(key, value, 'EX', ttlSeconds);
		else await this.client.set(key, value);
	}

	private async setObject(key: string, value: object, ttlSeconds?: number) {
		const json = JSON.stringify(value);
		return this.setString(key, json, ttlSeconds);
	}

	private async get<T>(key: string): Promise<T | null> {
		const raw = await this.client.get(key);
		if (!raw) return null;
		return JSON.parse(raw);
	}

	private async del(key: string) {
		await this.client.del(key);
	}

	private async bulkSet<T>(
		prefix: CacheKeyPrefix,
		items: T[],
		getKey: (x: T) => string,
		schema: z.ZodType<T> | null,
		ttlSeconds?: number
	) {
		const pipeline = this.client.pipeline();
		for (const item of items) {
			if (schema) schema.parse(item);
			const key = `${prefix}:${getKey(item)}`;
			const json = JSON.stringify(item);
			if (ttlSeconds) pipeline.set(key, json, 'EX', ttlSeconds);
			else pipeline.set(key, json);
		}
		await pipeline.exec();
	}

	async getGuild(id: string) {
		return this.get(`${CacheKeyPrefix.Guild}:${id}`);
	}

	async setGuild(guild: IGuild, ttl?: number) {
		ZGuild.parse(guild);
		await this.setObject(`${CacheKeyPrefix.Guild}:${guild.id}`, guild, ttl);
	}

	async getMember(guildID: string, userID: string) {
		return this.get<IMember>(`${CacheKeyPrefix.Member}:${guildID}:${userID}`);
	}

	async getMainServerMember(userID: string) {
		return this.get<IMember>(`${CacheKeyPrefix.Member}:${globalConfig.supportServerID}:${userID}`);
	}

	async setMember(member: IMember, ttl?: number) {
		ZMember.parse(member);
		await this.setObject(`${CacheKeyPrefix.Member}:${member.guild_id}:${member.id}`, member, ttl);
	}

	async bulkSetMembers(members: IMember[], ttl?: number) {
		await this.bulkSet(CacheKeyPrefix.Member, members, m => `${m.guild_id}:${m.id}`, ZMember, ttl);
	}

	async bulkSetChannels(channels: IChannel[], ttl?: number) {
		await this.bulkSet(CacheKeyPrefix.Channel, channels, c => `${c.guild_id}:${c.id}`, ZChannel, ttl);
	}

	async bulkSetEmojis(emojis: IEmoji[]) {
		await this.bulkSet(CacheKeyPrefix.Emoji, emojis, c => `${c.guild_id}:${c.id}`, ZEmoji);
	}

	async getRole(guildID: string, roleID: string) {
		return this.get(`${CacheKeyPrefix.Role}:${guildID}:${roleID}`);
	}

	async setRole(role: IRole, ttl?: number) {
		ZRole.parse(role);
		await this.setObject(`${CacheKeyPrefix.Role}:${role.guild_id}:${role.id}`, role, ttl);
	}

	async bulkSetRoles(roles: IRole[], ttl?: number) {
		await this.bulkSet(CacheKeyPrefix.Role, roles, r => `${r.guild_id}:${r.id}`, ZRole, ttl);
	}

	async deleteGuild(id: string) {
		await this.del(`${CacheKeyPrefix.Guild}:${id}`);
	}

	async setRoboChimpUser(data: RobochimpUser, ttlSeconds?: number) {
		await this.setObject(`${CacheKeyPrefix.RoboChimp}:user:${data.id}`, data, ttlSeconds);
	}

	async getRoboChimpUser(userID: string): Promise<RobochimpUser | null> {
		return this.get<RobochimpUser>(`${CacheKeyPrefix.RoboChimp}:user:${userID}`);
	}

	async bulkSetRoboChimpUser(users: RobochimpUser[], ttl?: number) {
		await this.bulkSet(CacheKeyPrefix.RoboChimp, users, c => `user:${c.id}`, null, ttl);
	}

	async _getBadgedUsernameRaw(userId: string): Promise<string | null> {
		return this.get(Key.User.BadgedUsername(userId));
	}

	async getBadgedUsername(userId: string): Promise<string> {
		return fetchUsernameAndCache(userId);
	}

	async setBadgedUsername(userId: string, badgedUsername: string) {
		await this.setString(Key.User.BadgedUsername(userId), badgedUsername);
	}

	async close() {
		await this.client.quit();
	}
}

global.Cache = new CacheManager();

declare global {
	var Cache: CacheManager;
}
