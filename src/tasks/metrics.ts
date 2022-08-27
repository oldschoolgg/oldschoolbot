import { Time } from 'e';
import { Task } from 'klasa';

import { collectMetrics } from '../lib/metrics';
import { prisma, queryCountStore } from '../lib/settings/prisma';

export default class extends Task {
	async init() {
		if (this.client.metricsInterval) {
			clearInterval(this.client.metricsInterval);
		}
		this.client.metricsInterval = setInterval(this.analyticsTick.bind(this), Number(Time.Minute));
	}

	async run() {
		this.analyticsTick();
	}

	async analyticsTick() {
		let storedCount = queryCountStore.value;
		queryCountStore.value = 0;

		await prisma.metric.create({
			data: {
				timestamp: Math.floor(Date.now() / 1000),
				...collectMetrics(),
				qps: storedCount / 60
			}
		});
	}
}
