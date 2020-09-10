import { Task } from 'klasa';
import { createConnection } from 'typeorm';
import PgBoss from 'pg-boss';

import { providerConfig } from '../config';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable';
import { activityTaskFilter } from '../lib/util';
import { TickerTaskData } from '../lib/types/minions';
import { Tasks } from '../lib/constants';

const { port, user, password, database } = providerConfig!.postgres!;

export default class extends Task {
	async init() {
		const boss = new PgBoss({ ...providerConfig?.postgres });
		boss.on('error', error => console.error(error));
		await boss.start();
		await boss.schedule('analytics', `* * * * *`);
		await boss.subscribe('analytics', async job => {
			this.analyticsTick();
			job.done();
		});

		this.client.orm = await createConnection({
			type: 'postgres',
			host: 'localhost',
			port,
			username: user,
			password,
			database,
			entities: [AnalyticsTable],
			synchronize: false,
			logging: true
		});
	}

	async run() {
		this.analyticsTick();
	}

	calculateMinionTaskCounts() {
		const minionTaskCounts = {
			[Tasks.ClueTicker]: 0,
			[Tasks.MinigameTicker]: 0,
			[Tasks.MonsterKillingTicker]: 0,
			[Tasks.SkillingTicker]: 0
		};
		for (const task of this.client.schedule.tasks.filter(activityTaskFilter)) {
			const taskData = task.data as TickerTaskData;
			minionTaskCounts[task.taskName] = taskData.subTasks.length;
		}
	}

	async analyticsTick() {
		const x = {
			guildsCount: this.client.guilds.size,
			membersCount: this.client.guilds.reduce((acc, curr) => (acc += curr.memberCount), 0),
			timestamp: Math.floor(Date.now() / 1000)
		};

		await AnalyticsTable.insert(x);
	}
}
