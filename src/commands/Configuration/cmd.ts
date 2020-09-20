import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			cooldown: 2,
			subcommands: true,
			usage: '<enable|disable> <command:cmd>',
			usageDelim: ' ',
			permissionLevel: 7
		});
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	async enable(msg: KlasaMessage, [command]: [Command]) {
		if (!msg.guild!.settings.get(GuildSettings.DisabledCommands).includes(command.name)) {
			return msg.sendLocale('CMD_ISNT_DISABLED');
		}
		await msg.guild!.settings.update('disabledCommands', command.name, {
			arrayAction: 'remove'
		});
		return msg.sendLocale('CMD_ENABLED', [command.name]);
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	async disable(msg: KlasaMessage, [command]: [Command]) {
		if (msg.guild!.settings.get(GuildSettings.DisabledCommands).includes(command.name)) {
			return msg.sendLocale('CMD_ALREADY_DISABLED');
		}
		await msg.guild!.settings.update(GuildSettings.DisabledCommands, command.name, {
			arrayAction: 'add'
		});
		return msg.sendLocale('CMD_DISABLED', [command.name]);
	}
}
