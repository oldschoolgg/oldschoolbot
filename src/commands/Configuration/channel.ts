import { CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			permissionLevel: 6,
			usage: '<disable|enable>',
			description: `Allows you to disable/enable the bot in a channel. If a channel is disabled, only staff of your server can use it in the channel.`,
			examples: ['+channel enable', '+channel disable'],
			categoryFlags: ['settings']
		});
	}

	async run(msg: KlasaMessage, [input]: [string]) {
		const isDisabled = msg.guild?.settings
			.get(GuildSettings.StaffOnlyChannels)
			.includes(msg.channel.id);

		if (input === 'disable') {
			if (isDisabled) return msg.send(`This channel is already disabled.`);

			await msg.guild!.settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
				arrayAction: 'add'
			});

			return msg.send(
				'Channel disabled. Staff of this server can still use commands in this channel.'
			);
		}
		if (!isDisabled) return msg.send(`This channel is already enabled.`);

		await msg.guild!.settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
			arrayAction: 'remove'
		});

		return msg.send('Channel enabled. Anyone can use commands in this channel now.');
	}
}
