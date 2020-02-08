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
		const joyReactions = msg.guild!.settings.get('joyReactions');
		if (joyReactions === msg.channel.id) {
			return msg.sendLocale('JOY_REACTIONS_ALREADY_ENABLED');
		}
		if (joyReactions) {
			await msg.guild!.settings.update('joyReactions', msg.channel);
			return msg.sendLocale('JOY_REACTIONS_ENABLED_OTHER');
		}
		await msg.guild!.settings.update('joyReactions', msg.channel);
		return msg.sendLocale('JOY_REACTIONS_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (!msg.guild!.settings.get('joyReactions')) {
			return msg.sendLocale('JOY_REACTIONS_ENABLED');
		}
		await msg.guild!.settings.reset('joyReactions');
		return msg.sendLocale('JOY_REACTIONS_DISABLED');
	}
}
