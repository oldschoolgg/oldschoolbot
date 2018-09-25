const { Task, Colors } = require('klasa');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes

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
	}

	async run() {
		let presences = 0, guildMembers = 0, emojis = 0, lastMessages = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Don't wipe the Old School Bot guild
			if (guild.id === '342983479501389826') continue;

			// Clear presences
			presences += guild.presences.size;
			guild.presences.clear();

			// Clear emojis
			emojis += guild.emojis.size;
			guild.emojis.clear();

			// Clear members
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				guildMembers++;
				guild.members.delete(id);
			}

			// Completely delete all voice channels, delete lastMessageID of channels
			for (const channel of guild.channels.values()) {
				if (channel.type === 'voice') {
					guild.channels.delete(channel.id);
					this.client.channels.delete(channel.id);
				} else if (channel.type === 'text') {
					if (!channel.lastMessageID) continue;
					channel.lastMessageID = null;
					lastMessages++;
				}
			}
		}

		/*
		DISABLED
		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			this.client.users.delete(user.id);
			this.client.gateways.users.cache.delete(user.id);
			users++;
		}
		*/

		// Emit a log
		this.client.emit('verbose',
			`${this.header} ${
				this.setColor(presences)} [Presence]s | ${
				this.setColor(guildMembers)} [GuildMember]s | ${
				this.setColor(emojis)} [Emoji]s | ${
				this.setColor(lastMessages)} [Last Message]s.`);
	}

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
