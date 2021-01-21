import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { triggerRandomEvent } from '../lib/random_events/triggerRandomEvent';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			enabled: true,
			ignoreBots: true,
			ignoreWebhooks: true,
			ignoreEdits: true
		});
	}

	async run(msg: KlasaMessage) {
		if (msg.content.includes('--event')) {
			triggerRandomEvent(msg.channel, msg.author);
		}
	}
}
