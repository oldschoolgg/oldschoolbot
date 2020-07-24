import { Colors, Task, TaskStore } from 'klasa';
import { SnowflakeUtil } from 'discord.js';

import { Time } from '../lib/constants';

const THRESHOLD = Time.Minute * 30;

export default class MemorySweeper extends Task {
	colors: { red: Colors; yellow: Colors; green: Colors };
	header: string;
	OLD_SNOWFLAKE: string;

	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: false
		});

		// The colors to stylise the console's logs
		this.colors = {
			red: new Colors({ text: 'lightred' }),
			yellow: new Colors({ text: 'lightyellow' }),
			green: new Colors({ text: 'green' })
		};

		// The header with the console colors
		this.header = new Colors({ text: 'lightblue' }).format('[CACHE CLEANUP]');
		this.OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now() - THRESHOLD);
	}

	async run() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const queryRes = await this.client.providers!.default!.runAll(
			`SELECT ARRAY(SELECT "id" FROM users WHERE "badges"::text <> '{}'::text OR "bank"::text <> '{}'::text OR "minion.hasBought" = true); `
		);

		const shouldCacheUsers: Set<string> = new Set(queryRes[0].array);

		let presences = 0;
		let guildMembers = 0;
		let voiceStates = 0;
		let emojis = 0;
		let users = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Don't wipe the Old School Bot guild
			if (guild.id === '342983479501389826') continue;

			// Clear presences
			presences += guild.presences.size;
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (shouldCacheUsers.has(member.user.id)) continue;
				if (member === me) continue;
				if (member.lastMessageID && member.lastMessageID > this.OLD_SNOWFLAKE) continue;
				guildMembers++;
				voiceStates++;
				guild.voiceStates.delete(id);
				guild.members.delete(id);
			}

			// Clear emojis
			emojis += guild.emojis.size;
			guild.emojis.clear();
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (shouldCacheUsers.has(user.id)) continue;
			this.client.users.delete(user.id);
			users++;
		}

		// Emit a log
		this.client.emit(
			'log',
			`${this.header} ${this.setColor(presences)} [Presence]s | ${this.setColor(
				guildMembers
			)} [GuildMember]s | ${this.setColor(voiceStates)} [VoiceState]s | ${this.setColor(
				users
			)} [User]s | ${this.setColor(emojis)} [Emoji]s`
		);
	}

	/**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {string}
	 */
	setColor(number: number) {
		const text = String(number).padStart(5, ' ');
		// Light Red color
		if (number > 1000) return this.colors.red.format(text);
		// Light Yellow color
		if (number > 100) return this.colors.yellow.format(text);
		// Green color
		return this.colors.green.format(text);
	}
}
