import { CloseEvent } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false
		});
	}

	async run(event: CloseEvent) {
		this.client.emit(Events.Log, `Shard Disconnect: ${event.reason} ${event.code}`);
	}
}
