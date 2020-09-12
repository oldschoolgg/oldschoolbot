import { Task } from 'klasa';
import { getPgBoss, refreshCacheWithActiveJobs } from '../lib/pgBoss';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { Tasks } from '../lib/constants';
import { ActivityTaskOptions } from '../lib/types/minions';

interface JobActivityTaskOptions extends ActivityTaskOptions {
	activity: Tasks;
}

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		await refreshCacheWithActiveJobs(this.client);
		const boss = await getPgBoss();
		for (const ticker of [
			Tasks.MonsterKillingTicker,
			Tasks.SkillingTicker,
			Tasks.ClueTicker,
			Tasks.MinigameTicker
		]) {
			await boss.subscribe(`osbot_${ticker}`, async job => {
				const jobData = job.data as JobActivityTaskOptions;
				await this.client.tasks.get(jobData.activity)?.run(jobData);
				// sync to make sure we are getting the most recent jobs
				await this.client.settings.sync(true);
				const currentJobs = Object.create(
					this.client.settings.get(ClientSettings.PgBossJobs)
				);
				delete currentJobs[job.id];
				await this.client.settings.update(ClientSettings.PgBossJobs, currentJobs);
				// sync again to make the bot to knows that a job was finished
				await this.client.settings.sync(true);
				job.done();
			});
		}
	}
}
