import { CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 7,
			runIn: ['text'],
			usage: '[prefix:str{1,3}]',
			description: 'Allows you to change the command prefix for your server.',
			examples: ['+prefix !', '+prefix ?'],
			categoryFlags: ['settings']
		});
	}

	async run(msg: KlasaMessage, [prefix]: [string]) {
		if (!prefix) {
			return msg.send(`The current prefix for your guild is: \`${msg.cmdPrefix}\``);
		}
		await msg.guild!.settings.update(GuildSettings.Prefix, prefix);
		return msg.send(`Changed Command Prefix for ${msg.guild!.name} to \`${prefix}\``);
	}
}
