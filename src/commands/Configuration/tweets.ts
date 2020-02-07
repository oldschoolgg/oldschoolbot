import { Command } from 'klasa';
import { GuildSettings } from '../../lib/GuildSettings';
import { CommandStore, KlasaMessage } from 'klasa';

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
