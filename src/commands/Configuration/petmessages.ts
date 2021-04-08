import { CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

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
			return msg.send(`Pet Messages are already enabled in this guild.`);
		}
		await msg.guild!.settings.update(GuildSettings.PetChannel, msg.channel);
		return msg.send(`Enabled Pet Messages in this guild.`);
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.PetChannel) === null) {
			return msg.send("Pet Messages aren't enabled, so you can't disable them.");
		}
		await msg.guild!.settings.reset(GuildSettings.PetChannel);
		return msg.send('Disabled Pet Messages in this guild.');
	}
}
