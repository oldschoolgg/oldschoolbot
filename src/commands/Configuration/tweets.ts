import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

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
			examples: ['+tweets on', '+tweets off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.send(TWEETS_RATELIMITING);
		}
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
