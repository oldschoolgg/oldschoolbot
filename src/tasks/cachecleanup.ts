import { SnowflakeUtil } from 'discord.js';
import { Time } from 'e';
import { Task, TaskStore } from 'klasa';

import { SupportServer } from '../lib/constants';
import PostgresProvider from '../providers/postgres';

const THRESHOLD = Time.Minute * 30;

export default class MemorySweeper extends Task {
	OLD_SNOWFLAKE: string;

	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true
		});

		this.OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now() - THRESHOLD);
	}

	async run() {
		const queryRes = await (this.client.providers.default as PostgresProvider).runAll(
			'SELECT ARRAY(SELECT "id" FROM users WHERE "badges"::text <> \'{}\'::text OR "bank"::text <> \'{}\'::text OR "minion.hasBought" = true); '
		);

		const shouldCacheUsers: Set<string> = new Set(queryRes[0].array);

		let presences = 0;
		let guildMembers = 0;
		let voiceStates = 0;
		let emojis = 0;
		let users = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.cache.values()) {
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
				if (member.lastMessageID && member.lastMessageID > this.OLD_SNOWFLAKE) continue;
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
		for (const user of this.client.users.cache.values()) {
			if (shouldCacheUsers.has(user.id)) continue;
			this.client.users.cache.delete(user.id);
			users++;
		}

		// Emit a log
		this.client.emit(
			'log',
			`CacheCleanup ${presences} [Presence]s | ${guildMembers} [GuildMember]s | ${voiceStates} [VoiceState]s | ${users} [User]s | ${emojis} [Emoji]s`
		);
	}
}
