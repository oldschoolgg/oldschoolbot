import { TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: Events.ServerNotification
		});
	}

	async run(message: string) {
		const channel = this.client.channels.get('732207379818479756');
		if (channel && this.client.production) (channel as TextChannel).send(message);
	}
}
