import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
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
		if (tweetChannel === msg.channel.id) {
			return msg.send(`Jmod Tweets are already enabled in this channel.`);
		}
		if (tweetChannel) {
			await msg.guild!.settings.update(GuildSettings.JModTweets, msg.channel);
			return msg.send(
				`Jmod Tweets are already enabled in another channel, but I've switched them to use this channel.`
			);
		}
		await msg.guild!.settings.update(GuildSettings.JModTweets, msg.channel);
		return msg.send(`Enabled Jmod Tweets in this channel.`);
	}

	async off(msg: KlasaMessage) {
		if (!msg.guild!.settings.get(GuildSettings.JModTweets)) {
			return msg.send("Jmod Tweets aren't enabled, so you can't disable them.");
		}
		await msg.guild!.settings.reset(GuildSettings.JModTweets);
		return msg.send('Disabled Jmod Tweets in this channel.');
	}
}
