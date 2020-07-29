import { Event, EventStore } from 'klasa';
import * as Sentry from '@sentry/node';

import { Events } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false
		});
	}

	async run(error: Error) {
		Sentry.captureException(error);
		this.client.emit(Events.Log, `Shard Error: ${error}`);
	}
}
