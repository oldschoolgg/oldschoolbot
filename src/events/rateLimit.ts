import { RateLimitData } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'rateLimit'
		});
	}

	async run(limit: RateLimitData) {
		this.client.emit(Events.Wtf, `Ratelimited: ${JSON.stringify(limit)}`);
	}
}
