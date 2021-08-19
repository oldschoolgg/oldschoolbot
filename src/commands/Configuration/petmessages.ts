import { CommandStore, KlasaMessage } from 'klasa';

import { getGuildSettings } from '../../lib/settings/settings';
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
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.PetChannel)) {
			return msg.channel.send('Pet Messages are already enabled in this guild.');
		}
		await settings.update(GuildSettings.PetChannel, msg.channel);
		return msg.channel.send('Enabled Pet Messages in this guild.');
	}

	async off(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.PetChannel) === null) {
			return msg.channel.send("Pet Messages aren't enabled, so you can't disable them.");
		}
		await settings.reset(GuildSettings.PetChannel);
		return msg.channel.send('Disabled Pet Messages in this guild.');
	}
}
