import { Task } from 'klasa';
import { getPgBoss } from '../lib/pgBoss';

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		const boss = await getPgBoss();
		for (const ticker of ['monsterTicker', 'clueTicker', 'minigameTicker', 'skillingTicker']) {
			await boss.subscribe(`osbot_${ticker}`, async job => {
				const jobData: any = job.data;
				await this.client.tasks.get(jobData.activity)?.run(jobData.data);
				job.done();
			});
		}
	}
}
