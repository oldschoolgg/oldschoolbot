import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			subcommands: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get('petchannel')) {
			return msg.sendLocale('PET_MESSAGES_ALREADY_ENABLED');
		}
		await msg.guild!.settings.update('petchannel', msg.channel);
		return msg.sendLocale('PET_MESSAGES_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get('petchannel') === null) {
			return msg.sendLocale('PET_MESSAGES_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset('petchannel');
		return msg.sendLocale('PET_MESSAGES_DISABLED');
	}
}
