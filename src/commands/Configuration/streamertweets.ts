import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Posts tweets from OSRS streamers in your server',
			examples: ['+streamertweets on', '+streamertweets off']
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
