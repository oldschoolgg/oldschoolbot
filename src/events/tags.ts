import { Event, EventStore, KlasaMessage } from 'klasa';

import { Channel, SupportServer } from '../lib/constants';
import { getGuildSettingsCached } from '../lib/settings/settings';
import { GuildSettings } from '../lib/settings/types/GuildSettings';

export default class TagHandler extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'commandUnknown',
			name: 'tags.handler'
		});
	}

	async run(message: KlasaMessage, command: string) {
		const tagCommand = this.client.commands.get('tag') as any;
		try {
			const settings = getGuildSettingsCached(message.guild!);
			if (!settings) return;
			const tag = settings.get(GuildSettings.Tags).find(([name]) => name === command.toLowerCase());
			if (!tag) return;

			if (!message.guild || message.guild.id !== SupportServer || message.channel.id !== Channel.SupportChannel) {
				await this.client.inhibitors.run(message, tagCommand);
			}

			try {
				message.channel.send(tag[1]);
			} catch (error) {
				this.client.emit('commandError', message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, tagCommand, response);
		}
	}
}
