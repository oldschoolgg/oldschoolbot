import { TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { Channel, Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: Events.ServerNotification
		});
	}

	async run(message: string) {
		const channel = globalClient.channels.cache.get(Channel.Notifications);
		if (channel && globalClient.production) (channel as TextChannel).send(message);
	}
}
