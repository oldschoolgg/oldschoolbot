import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			runIn: ['text'],
			usage: '<on|off>',
			requiredPermissionsForUser: ['BAN_MEMBERS'],
			requiredPermissionsForBot: ['EMBED_LINKS'],
			description: 'Allows you to receive tweets from all JMods and the OSRS Twitter to your channel.',
			examples: ['+tweets on', '+tweets off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.channel.send(TWEETS_RATELIMITING);
		}
		const tweetChannel = settings.get(GuildSettings.JModTweets);
		if (tweetChannel === msg.channel.id) {
			return msg.channel.send('Jmod Tweets are already enabled in this channel.');
		}
		if (tweetChannel) {
			await settings.update(GuildSettings.JModTweets, msg.channel);
			return msg.channel.send(
				"Jmod Tweets are already enabled in another channel, but I've switched them to use this channel."
			);
		}
		await settings.update(GuildSettings.JModTweets, msg.channel);
		return msg.channel.send('Enabled Jmod Tweets in this channel.');
	}

	async off(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (!settings.get(GuildSettings.JModTweets)) {
			return msg.channel.send("Jmod Tweets aren't enabled, so you can't disable them.");
		}
		await settings.reset(GuildSettings.JModTweets);
		return msg.channel.send('Disabled Jmod Tweets in this channel.');
	}
}
