import { Event, EventStore } from 'klasa';

import { Channel, Events } from '../lib/constants';
import { sendToChannelID } from '../lib/util/webhook';

let buffer: string[] = [];

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: Events.EconomyLog
		});
	}

	async run(message: string) {
		buffer.push(message);
		if (buffer.length === 10) {
			await sendToChannelID(this.client, Channel.EconomyLogs, {
				content: buffer.join('\n')
			});
			buffer = [];
		}
	}
}
