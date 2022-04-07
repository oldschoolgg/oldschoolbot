import { SnowflakeUtil } from 'discord.js';
import { Time } from 'e';
import { KlasaClient } from 'klasa';

import type PostgresProvider from '../providers/postgres';
import { SupportServer } from './constants';

const THRESHOLD = Time.Minute * 30;
const OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now() - THRESHOLD);

export async function cacheCleanup(client: KlasaClient) {
	const queryRes = await (client.providers.default as PostgresProvider).runAll(
		'SELECT ARRAY(SELECT "id" FROM users WHERE "badges"::text <> \'{}\'::text OR "bank"::text <> \'{}\'::text OR "minion.hasBought" = true); '
	);

	const shouldCacheUsers: Set<string> = new Set(queryRes[0].array);

	let presences = 0;
	let guildMembers = 0;
	let voiceStates = 0;
	let emojis = 0;
	let users = 0;
	let channels = 0;

	for (const ch of client.channels.cache.values()) {
		if (['voice', 'category', 'news', 'dm', 'stage'].includes(ch.type)) {
			client.channels.cache.delete(ch.id);
			channels++;
			continue;
		}

		const c = ch as any;

		delete c.topic;
		delete c.lastPinTimestamp;
		delete c.deleted;
		delete c.name;
		delete c._typing;
		delete c.rateLimitPerUser;
		delete c.nsfw;
	}

	// Per-Guild sweeper
	for (const guild of client.guilds.cache.values()) {
		// Don't wipe the Old School Bot guild
		if (guild.id === SupportServer) continue;

		// Clear presences
		presences += guild.presences.cache.size;
		guild.presences.cache.clear();

		// Clear members that haven't send a message in the last 30 minutes
		const { me } = guild;
		for (const [id, member] of guild.members.cache) {
			if (shouldCacheUsers.has(member.user.id)) continue;
			if (member === me) continue;
			if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
			guildMembers++;
			voiceStates++;
			guild.voiceStates.cache.delete(id);
			guild.members.cache.delete(id);
		}

		// Clear emojis
		emojis += guild.emojis.cache.size;
		guild.emojis.cache.clear();
	}

	// Per-User sweeper
	// for (const user of client.users.cache.values()) {
	// 	if (shouldCacheUsers.has(user.id)) continue;
	// 	client.users.cache.delete(user.id);
	// 	users++;
	// }

	// Emit a log
	client.emit(
		'log',
		`CacheCleanup ${presences} [Presence]s | ${guildMembers} [GuildMember]s | ${voiceStates} [VoiceState]s | ${users} [User]s | ${emojis} [Emoji]s | ${channels} Channels`
	);
}
