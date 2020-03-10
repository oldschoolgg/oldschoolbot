import { Event, EventStore } from 'klasa';
import { TextChannel } from 'discord.js';

import { Events, Channel } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: Events.ServerNotification
		});
	}

	async run(message: string) {
		const channel = this.client.channels.get(Channel.Notifications);
		if (channel) (channel as TextChannel).send(message);
	}
}
