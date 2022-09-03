import { Task } from 'klasa';

import { makeServer } from '../lib/http';

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		if (globalClient.fastifyServer) {
			globalClient.fastifyServer.close();
			// @ts-ignore trust me
			globalClient.fastifyServer = undefined;
		}

		globalClient.fastifyServer = makeServer();
	}
}
