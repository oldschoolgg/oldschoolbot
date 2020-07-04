import { Event } from 'klasa';

export default class extends Event {
	public run(err: { code: number; reason: string }) {
		this.client.console.error(`Disconnected | ${err.code}: ${err.reason}`);
		this.client.console.log(`Disconnected | ${err.code}: ${err.reason}`);
	}
}
