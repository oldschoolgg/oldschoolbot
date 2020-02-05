import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Disable the bot in a channel.',
			usage: '<disable|enable>'
		});
	}

	async run(msg: KlasaMessage, [input]: [string]) {
		const isDisabled = msg.guild?.settings.get('staffOnlyChannels').includes(msg.channel.id);

		if (input === 'disable') {
			if (isDisabled) throw `This channel is already disabled.`;

			await msg.guild!.settings.update('staffOnlyChannels', msg.channel.id, {
				action: 'add'
			});

			return msg.sendLocale('CHANNEL_DISABLED');
		} else {
			if (!isDisabled) throw `This channel is already enabled.`;

			await msg.guild!.settings.update('staffOnlyChannels', msg.channel.id, {
				action: 'remove'
			});

			return msg.sendLocale('CHANNEL_ENABLED');
		}
	}
}
