const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			subcommands: true,
			aliases: ['tn'],
			description: 'Enables/disables the Twitch Notifications function which sends tweets from OSRS Streamers.',
			runIn: ['text'],
			usage: '<list|enable|disable|add|remove> [streamer_name:str]',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('twitchnotifs') === msg.channel.id) throw `Twitch Notifications are already enabled in this channel.`;
		if (msg.guild.settings.get('twitchnotifs') !== null) {
			await msg.guild.settings.update('twitchnotifs', msg.channel, msg.guild);
			return msg.send(`Twitch Notifications are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('twitchnotifs', msg.channel, msg.guild);
		return msg.send(`Enabled Twitch Notifications in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.settings.get('twitchnotifs') === null) return msg.send("Twitch Notifications aren't enabled, so you can't disable them.");
		await msg.guild.settings.reset('twitchnotifs');
		return msg.send(`Disabled Twitch Notifications in this channel.`);
	}

	async add(msg, [name]) {
		if (!name) throw 'Please include which streamer you want to add, like this: `+tn add B0aty`';
		if (msg.guild.settings.get('twitchnotifs') === null) throw "You can't add or remove streamers if you have Twitch Notifications disabled.";
		if (!this.client.streamers.includes(name.toLowerCase())) throw "That streamer doesn't look like a Old School RuneScape Streamer to me.";
		if (msg.guild.settings.get('streamers').includes(name.toLowerCase())) throw 'Twitch Notifications are already enabled for this streamer.';
		await msg.guild.settings.update('streamers', name.toLowerCase(), { action: 'add' });
		return msg.send(`Successfully added ${name}. You will receive a message here when they go live.`);
	}

	async remove(msg, [name]) {
		if (!name) throw 'Please include which streamer you want to remove, like this: +tn remove B0aty';
		if (msg.guild.settings.get('twitchnotifs') === null) throw "You can't add or remove streamers if you have Twitch Notifications disabled.";
		if (!this.client.streamers.includes(name.toLowerCase())) throw "That streamer doesn't look like a Old School RuneScape Streamer to me.";
		if (!msg.guild.settings.get('streamers').includes(name.toLowerCase())) {
			throw "Twitch Notifications aren't enabled for this streamer, so you cannot remove them.";
		}

		await msg.guild.settings.update('streamers', name.toLowerCase(), { action: 'remove' });
		return msg.send(`Successfully removed ${name}.`);
	}

	async list(msg) {
		if (msg.guild.settings.get('twitchnotifs') === null) throw 'Twitch Notifications are not enabled in this guild.';
		if (msg.guild.settings.get('streamers').length === 0) throw 'You have Twitch Notifications enabled, but no streamers added.';
		return msg.send(msg.guild.settings.get('streamers').join(', '));
	}


};
