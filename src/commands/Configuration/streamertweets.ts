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
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Posts tweets from OSRS streamers in your server',
			examples: ['+streamertweets on', '+streamertweets off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.channel.send(TWEETS_RATELIMITING);
		}
		if (settings.get(GuildSettings.StreamerTweets) === msg.channel.id) {
			return msg.channel.send('Streamer Tweets are already enabled in this channel.');
		}
		if (settings.get(GuildSettings.StreamerTweets) !== null) {
			await settings.update(GuildSettings.StreamerTweets, msg.channel);
			return msg.channel.send(
				"Streamer Tweets are already enabled in another channel, but I've switched them to use this channel."
			);
		}
		await settings.update(GuildSettings.StreamerTweets, msg.channel);
		return msg.channel.send('Enabled Streamer Tweets in this channel.');
	}

	async off(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.StreamerTweets) === null) {
			return msg.channel.send("Streamer Tweets aren't enabled, so you can't disable them.");
		}
		await settings.reset(GuildSettings.StreamerTweets);
		return msg.channel.send('Disabled Streamer Tweets in this channel.');
	}
}
