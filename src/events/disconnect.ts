import { Event } from 'klasa';

import { Events } from '../lib/constants';

export default class extends Event {
	public run(err: { code: number; reason: string }) {
		this.client.emit(Events.Log, `Disconnected | ${err.code}: ${err.reason}`);
	}
}
