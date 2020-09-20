import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) === msg.channel.id) {
			return msg.sendLocale('STREAMER_TWEETS_ALREADY_ENABLED');
		}
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) !== null) {
			await msg.guild!.settings.update(GuildSettings.StreamerTweets, msg.channel);
			return msg.sendLocale('STREAMER_TWEETS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update(GuildSettings.StreamerTweets, msg.channel);
		return msg.sendLocale('STREAMER_TWEETS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) === null) {
			return msg.sendLocale('STREAMER_TWEETS_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.StreamerTweets);
		return msg.sendLocale('STREAMER_TWEETS_DISABLED');
	}
}
