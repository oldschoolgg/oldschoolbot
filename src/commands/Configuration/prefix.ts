import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 7,
			runIn: ['text'],
			usage: '[prefix:str{1,3}]'
		});
	}

	async run(msg: KlasaMessage, [prefix]: [string]) {
		if (!prefix) {
			return msg.sendLocale('PREFIX_CURRENT', [
				msg.guild!.settings.get(GuildSettings.Prefix)
			]);
		}
		await msg.guild!.settings.update('prefix', prefix);
		return msg.sendLocale('PREFIX_CHANGED', [msg.guild!.name, prefix]);
	}
}
