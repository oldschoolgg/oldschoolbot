import { Time } from 'e';
import { Task } from 'klasa';

import { collectMetrics } from '../lib/metrics';
import { MetricsTable } from '../lib/typeorm/MetricsTable.entity';

export default class extends Task {
	async init() {
		if (this.client.metricsInterval) {
			clearInterval(this.client.metricsInterval);
		}
		this.client.metricsInterval = setInterval(
			this.analyticsTick.bind(this),
			Number(Time.Minute)
		);
	}

	async run() {
		this.analyticsTick();
	}

	async analyticsTick() {
		await MetricsTable.insert({
			timestamp: Math.floor(Date.now() / 1000),
			...collectMetrics()
		});
	}
}
