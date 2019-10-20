const { Task, Colors } = require('klasa');
const { SnowflakeUtil } = require('discord.js');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30;

module.exports = class MemorySweeper extends Task {
	constructor(...args) {
		super(...args);

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

	shouldCacheUser(user) {
		if (
			user.settings.get('RSN') ||
			user.settings.get('badges').length > 0 ||
			Object.keys(user.settings.get('pets')).length > 0
		)
			return true;
		if (user.lastMessageID && user.lastMessageID > this.OLD_SNOWFLAKE) return true;
	}

	async run() {
		let presences = 0,
			guildMembers = 0,
			voiceStates = 0,
			emojis = 0,
			lastMessages = 0,
			users = 0;

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
				if (this.shouldCacheUser(member.user)) continue;
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

		// Per-Channel sweeper
		for (const channel of this.client.channels.values()) {
			if (!channel.lastMessageID) continue;
			channel.lastMessageID = null;
			lastMessages++;
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (this.shouldCacheUser(user)) continue;
			this.client.users.delete(user.id);
			users++;
		}

		// Emit a log
		this.client.emit(
			'verbose',
			`${this.header} ${this.setColor(presences)} [Presence]s | ${this.setColor(
				guildMembers
			)} [GuildMember]s | ${this.setColor(voiceStates)} [VoiceState]s | ${this.setColor(
				users
			)} [User]s | ${this.setColor(emojis)} [Emoji]s | ${this.setColor(
				lastMessages
			)} [Last Message]s.`
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
	setColor(number) {
		const text = String(number).padStart(5, ' ');
		// Light Red color
		if (number > 1000) return this.colors.red.format(text);
		// Light Yellow color
		if (number > 100) return this.colors.yellow.format(text);
		// Green color
		return this.colors.green.format(text);
	}
};
