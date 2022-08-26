import { Monitor, MonitorStore } from 'klasa';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: true,
			ignoreBots: false
		});
	}

	public async run() {
		//
	}
}
