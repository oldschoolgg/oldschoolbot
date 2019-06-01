// Thanks to https://github.com/kyranet
const { Task } = require('klasa');
const { util: { binaryToID } } = require('discord.js');

const THRESHOLD = 1000 * 60 * 30;
const EPOCH = 1420070400000;
const EMPTY = '0000100000000000000000';

module.exports = class extends Task {

	async run() {
		const OLD_SNOWFLAKE = binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
		let presences = 0, guildMembers = 0, emojis = 0, lastMessages = 0, users = 0;

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

			// Per-User sweeper
			for (const user of this.client.users.values()) {
				if (user.settings.get('RSN')) continue;
				if (Object.keys(user.settings.get('pets')).length > 0) continue;
				if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
				this.client.users.delete(user.id);
				users++;
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
		this.client.emit('verbose', `Cleared ${users} [Users]s | ${presences} [Presence]s | ` +
		`${guildMembers} [GuildMember]s | ${emojis} [Emoji]s | ${lastMessages} [Last Message]s.`);
	}


};
