import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			subcommands: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			description:
				'Enables a system for your server where talking allows you to get pets, separate to minion pets and your bank.',
			examples: ['+petmessages on', '+petmessages off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.PetChannel)) {
			return msg.sendLocale('PET_MESSAGES_ALREADY_ENABLED');
		}
		await msg.guild!.settings.update(GuildSettings.PetChannel, msg.channel);
		return msg.sendLocale('PET_MESSAGES_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.PetChannel) === null) {
			return msg.sendLocale('PET_MESSAGES_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.PetChannel);
		return msg.sendLocale('PET_MESSAGES_DISABLED');
	}
}
