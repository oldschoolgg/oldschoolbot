import { Command, CommandStore, KlasaMessage } from 'klasa';

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
		const ashTweetsChannel = msg.guild!.settings.get('ashTweetsChannel');
		if (ashTweetsChannel === msg.channel.id) {
			return msg.sendLocale('ASH_TWEETS_ALREADY_ENABLED');
		}
		if (ashTweetsChannel) {
			await msg.guild!.settings.update('ashTweetsChannel', msg.channel);
			return msg.sendLocale('ASH_TWEETS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update('ashTweetsChannel', msg.channel);
		return msg.sendLocale('ASH_TWEETS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (!msg.guild!.settings.get('ashTweetsChannel')) {
			return msg.sendLocale('ASH_TWEETS_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset('ashTweetsChannel');
		return msg.sendLocale(`ASH_TWEETS_DISABLED`);
	}
}
