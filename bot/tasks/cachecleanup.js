const { Task } = require('klasa');

module.exports = class extends Task {

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

		// Emit a log
		this.client.emit('verbose', `Cleared ${presences} [Presence]s | ` +
		`${guildMembers} [GuildMember]s | ${emojis} [Emoji]s | ${lastMessages} [Last Message]s.`);
	}


};
