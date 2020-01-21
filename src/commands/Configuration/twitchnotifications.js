const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			subcommands: true,
			aliases: ['tn'],
			description:
				'Enables/disables the Twitch Notifications function which sends tweets from OSRS Streamers.',
			runIn: ['text'],
			usage: '<list|enable|disable|add|remove> [streamer_name:str]',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('twitchnotifs') === msg.channel.id) {
			return msg.sendLocale('TN_ALREADY_ENABLED');
		}
		if (msg.guild.settings.get('twitchnotifs') !== null) {
			await msg.guild.settings.update('twitchnotifs', msg.channel, msg.guild);
			return msg.sendLocale('TN_ENABLED_OTHER');
		}
		await msg.guild.settings.update('twitchnotifs', msg.channel, msg.guild);
		return msg.sendLocale('TN_ENABLED');
	}

	async disable(msg) {
		if (msg.guild.settings.get('twitchnotifs') === null) {
			return msg.sendLocale('TN_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('twitchnotifs');
		return msg.sendLocale('TN_DISABLED');
	}

	async add(msg, [name]) {
		if (!name) {
			return msg.sendLocale('TN_NO_STREAMER', [msg.guild.settings.get('prefix')]);
		}
		if (!this.client.streamers.includes(name.toLowerCase())) {
			return msg.sendLocale('TN_INVALID_STREAMER');
		}
		if (msg.guild.settings.get('streamers').includes(name.toLowerCase())) {
			return msg.sendLocale('TN_ALREADY_ENABLED_STREAMER');
		}
		await msg.guild.settings.update('streamers', name.toLowerCase(), { action: 'add' });
		return msg.sendLocale('TN_ADDED_STREAMER', [name]);
	}

	async remove(msg, [name]) {
		if (!name) {
			return msg.sendLocale('TN_NO_STREAMER_REMOVE', [msg.guild.settings.get('prefix')]);
		}
		if (!this.client.streamers.includes(name.toLowerCase()))
			return msg.sendLocale('TN_INVALID_STREAMER');
		if (!msg.guild.settings.get('streamers').includes(name.toLowerCase())) {
			return msg.sendLocale('TN_NOT_ENABLED_STREAMER');
		}

		await msg.guild.settings.update('streamers', name.toLowerCase(), { action: 'remove' });
		return msg.sendLocale('TN_REMOVE', [name]);
	}

	async list(msg) {
		if (msg.guild.settings.get('twitchnotifs') === null) {
			return msg.sendLocale('TN_NOT_ENABLED');
		}
		if (msg.guild.settings.get('streamers').length === 0) {
			return msg.sendLocale('TN_NO_STREAMERS');
		}
		return msg.sendLocale(msg.guild.settings.get('streamers').join(', '));
	}
};
