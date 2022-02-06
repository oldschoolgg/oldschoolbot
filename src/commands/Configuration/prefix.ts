import { CommandStore, KlasaMessage } from 'klasa';

import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			requiredPermissionsForUser: ['BAN_MEMBERS'],
			runIn: ['text'],
			usage: '[prefix:str{1,3}]',
			description: 'Allows you to change the command prefix for your server.',
			examples: ['+prefix !', '+prefix ?'],
			categoryFlags: ['settings']
		});
	}

	async run(msg: KlasaMessage, [prefix]: [string]) {
		if (!prefix) {
			return msg.channel.send(`The current prefix for your guild is: \`${msg.cmdPrefix}\``);
		}
		const settings = await getGuildSettings(msg.guild!);
		await settings.update(GuildSettings.Prefix, prefix);
		return msg.channel.send(`Changed Command Prefix for ${msg.guild!.name} to \`${prefix}\``);
	}
}
