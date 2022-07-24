import { Time } from 'e';
import { Task } from 'klasa';

import { collectMetrics } from '../lib/metrics';
import { prisma } from '../lib/settings/prisma';

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
		await prisma.metric.create({
			data: {
				timestamp: Math.floor(Date.now() / 1000),
				...collectMetrics()
			}
		});
	}
}
