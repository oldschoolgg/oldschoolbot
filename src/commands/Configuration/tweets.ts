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
			description:
				'Allows you to receive tweets from all JMods and the OSRS Twitter to your channel.',
			examples: ['+tweets on', '+tweets off']
		});
	}

	async on(msg: KlasaMessage) {
		const tweetChannel = msg.guild!.settings.get(GuildSettings.JModTweets);
		if (tweetChannel === msg.channel.id) return msg.sendLocale('JMOD_TWEETS_ALREADY_ENABLED');
		if (tweetChannel) {
			await msg.guild!.settings.update(GuildSettings.JModTweets, msg.channel);
			return msg.sendLocale('JMOD_TWEETS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update(GuildSettings.JModTweets, msg.channel);
		return msg.sendLocale('JMOD_TWEETS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (!msg.guild!.settings.get(GuildSettings.JModTweets)) {
			return msg.sendLocale('JMOD_TWEETS_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.JModTweets);
		return msg.sendLocale('JMOD_TWEETS_DISABLED');
	}
}
