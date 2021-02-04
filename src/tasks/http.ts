import { Task } from 'klasa';

import { makeServer } from '../lib/http';

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		if (this.client.fastifyServer) {
			this.client.fastifyServer.close();
			this.client.fastifyServer = undefined;
		}

		this.client.fastifyServer = makeServer();
	}
}
