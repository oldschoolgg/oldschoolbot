import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false
		});
	}

	async run(shardID: number) {
		globalClient.emit(Events.Log, `Shard Reconnecting: ${shardID}`);
	}
}
