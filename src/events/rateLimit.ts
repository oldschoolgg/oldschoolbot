import { Event, EventStore } from 'klasa';
import { RateLimitData } from 'discord.js';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'rateLimit'
		});
	}

	async run(limit: RateLimitData) {
		console.error(`Ratelimited: ${JSON.stringify(limit)}`);
	}
}
