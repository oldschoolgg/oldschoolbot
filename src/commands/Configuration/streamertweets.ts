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
			description: 'Posts tweets from OSRS streamers in your server',
			examples: ['+streamertweets on', '+streamertweets off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.send(TWEETS_RATELIMITING);
		}
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) === msg.channel.id) {
			return msg.send(`Streamer Tweets are already enabled in this channel.`);
		}
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) !== null) {
			await msg.guild!.settings.update(GuildSettings.StreamerTweets, msg.channel);
			return msg.send(
				`Streamer Tweets are already enabled in another channel, but I've switched them to use this channel.`
			);
		}
		await msg.guild!.settings.update(GuildSettings.StreamerTweets, msg.channel);
		return msg.send(`Enabled Streamer Tweets in this channel.`);
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.StreamerTweets) === null) {
			return msg.send("Streamer Tweets aren't enabled, so you can't disable them.");
		}
		await msg.guild!.settings.reset(GuildSettings.StreamerTweets);
		return msg.send('Disabled Streamer Tweets in this channel.');
	}
}
