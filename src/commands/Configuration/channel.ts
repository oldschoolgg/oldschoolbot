import { CommandStore, KlasaMessage } from 'klasa';

import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			requiredPermissionsForUser: ['BAN_MEMBERS'],
			usage: '<disable|enable>',
			description:
				'Allows you to disable/enable the bot in a channel. If a channel is disabled, only staff of your server can use it in the channel.',
			examples: ['+channel enable', '+channel disable'],
			categoryFlags: ['settings']
		});
	}

	async run(msg: KlasaMessage, [input]: [string]) {
		const settings = await getGuildSettings(msg.guild!);
		const isDisabled = settings.get(GuildSettings.StaffOnlyChannels).includes(msg.channel.id);

		if (input === 'disable') {
			if (isDisabled) return msg.channel.send('This channel is already disabled.');

			await settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
				arrayAction: 'add'
			});

			return msg.channel.send('Channel disabled. Staff of this server can still use commands in this channel.');
		}
		if (!isDisabled) return msg.channel.send('This channel is already enabled.');

		await settings.update(GuildSettings.StaffOnlyChannels, msg.channel.id, {
			arrayAction: 'remove'
		});

		return msg.channel.send('Channel enabled. Anyone can use commands in this channel now.');
	}
}
