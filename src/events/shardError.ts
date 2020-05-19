import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'shardError'
		});
	}

	async run(error: Error) {
		this.client.emit(Events.Wtf, `Shard Error: ${error}`);
	}
}
