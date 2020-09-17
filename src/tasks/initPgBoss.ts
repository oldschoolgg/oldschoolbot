import { Task } from 'klasa';

import { Tasks } from '../lib/constants';
import { bossStart, freeMinion } from '../lib/pgBoss';
import { ActivityTaskOptions } from '../lib/types/minions';

interface JobActivityTaskOptions extends ActivityTaskOptions {
	activity: Tasks;
}

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		const boss = await bossStart();
		for (const ticker of [
			Tasks.MonsterKillingTicker,
			Tasks.SkillingTicker,
			Tasks.ClueTicker,
			Tasks.MinigameTicker
		]) {
			await boss.subscribe(`osbot_${ticker}`, async job => {
				const jobData = job.data as JobActivityTaskOptions;
				console.log('?');
				await freeMinion(jobData.userID);
				console.log('??');
				await (this.client.tasks.get(jobData.activity)?.run(jobData) as Promise<any>).catch(
					console.error
				);
				console.log('???');
				job.done();
			});
		}
	}
}
