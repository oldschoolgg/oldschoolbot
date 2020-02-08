import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			enabled: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === msg.channel.id) {
			return msg.sendLocale('JMOD_COMMENTS_ALREADY_ENABLED');
		}
		if (msg.guild!.settings.get(GuildSettings.JMODComments) !== null) {
			await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
			return msg.sendLocale('JMOD_COMMENTS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
		return msg.sendLocale('JMOD_COMMENTS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === null) {
			return msg.sendLocale('JMOD_COMMENTS_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.JMODComments);
		return msg.sendLocale('JMOD_COMMENTS_DISABLED');
	}
}
