import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			cooldown: 2,
			subcommands: true,
			usage: '<enable|disable|silence> <command:cmd>',
			usageDelim: ' ',
			permissionLevel: 7,
			description: 'Allows you to enable/disable commands in your server, or silence warnings for disabled commands',
			examples: ['+cmd enable casket', '+cmd disable casket', 'cmd silence enable', 'cmd silence disable'],
			categoryFlags: ['settings']
		});
	}

	// @ts-ignore 2416
	async enable(msg: KlasaMessage, [command]: [Command]) {
		if (!msg.guild!.settings.get(GuildSettings.DisabledCommands).includes(command.name)) {
			return msg.send("That command isn't disabled.");
		}
		this.store.get(command.name)!.disabled = false;
		await msg.guild!.settings.update('disabledCommands', command.name, {
			arrayAction: 'remove'
		});
		return msg.send(`Successfully enabled the \`${command.name}\` command.`);
	}

	// @ts-ignore 2416
	async disable(msg: KlasaMessage, [command]: [Command]) {
		if (msg.guild!.settings.get(GuildSettings.DisabledCommands).includes(command.name)) {
			return msg.send('That command is already disabled.');
		}
		this.store.get(command.name)!.disabled = true;
		await msg.guild!.settings.update(GuildSettings.DisabledCommands, command.name, {
			arrayAction: 'add'
		});
		return msg.send(`Successfully disabled the \`${command.name}\` command.`);
	}

	// @ts-ignore 2416
	async silence(msg: KlasaMessage, [command]: [Command]) {
		if (!msg.guild!.settings.get(GuildSettings.Silenced) && command.name == 'enable') {
			msg.guild!.settings.set(GuildSettings.Silenced, true);
			return msg.send(`Successfully silenced disabled commands.`);
		}
		else if (msg.guild!.settings.get(GuildSettings.Silenced) && command.name == 'enable') {
			return msg.send(`Disabled commands are already silenced.`);
		} 
		else if (msg.guild!.settings.get(GuildSettings.Silenced) && command.name == 'disable') {
			msg.guild!.settings.set(GuildSettings.Silenced, false);
			return msg.send(`Successfully unsilenced disabled commands.`);
		}
		else {
			return msg.send(`Disabled commands are already unsilenced.`);
		}
	}
}
