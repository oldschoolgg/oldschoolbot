import { Event, EventStore } from 'klasa';

import { Events } from '../lib/constants';
import { logError } from '../lib/util/logError';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false
		});
	}

	async run(error: Error) {
		logError(error);
		this.client.emit(Events.Log, `Shard Error: ${error.stack ?? error.name}`);
	}
}
