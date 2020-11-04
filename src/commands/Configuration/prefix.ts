import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 7,
			runIn: ['text'],
			usage: '[prefix:str{1,3}]',
			description: 'Allows you to change the command prefix for your server.',
			examples: ['+prefix !', '+prefix ?']
		});
	}

	async run(msg: KlasaMessage, [prefix]: [string]) {
		if (!prefix) {
			return msg.sendLocale('PREFIX_CURRENT', [
				msg.guild!.settings.get(GuildSettings.Prefix)
			]);
		}
		await msg.guild!.settings.update(GuildSettings.Prefix, prefix);
		return msg.sendLocale('PREFIX_CHANGED', [msg.guild!.name, prefix]);
	}
}
