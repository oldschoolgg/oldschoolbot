import { Task } from 'klasa';
import { createConnection } from 'typeorm';
import * as PgBoss from 'pg-boss';

import { providerConfig } from '../config';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable';
import { activityTaskFilter } from '../lib/util';
import { TickerTaskData } from '../lib/types/minions';
import { Tasks } from '../lib/constants';

const { port, user, password, database } = providerConfig!.postgres!;

export default class extends Task {
	async init() {
		if (this.client.orm) return;
		this.client.orm = await createConnection({
			type: 'postgres',
			host: 'localhost',
			port,
			username: user,
			password,
			database,
			entities: [AnalyticsTable],
			synchronize: true
		});

		const boss = new PgBoss({ ...providerConfig?.postgres });
		boss.on('error', error => console.error(error));
		await boss.start();
		await boss.schedule('analytics', `* * * * *`);
		await boss.subscribe('analytics', async job => {
			this.analyticsTick();
			job.done();
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
			const taskName = task.taskName as
				| Tasks.ClueTicker
				| Tasks.MinigameTicker
				| Tasks.MonsterKillingTicker
				| Tasks.SkillingTicker;
			if (minionTaskCounts[taskName] !== 0) {
				console.log(taskName);
				console.error('wtf');
			}
			minionTaskCounts[taskName] = taskData.subTasks.length;
		}
		return minionTaskCounts;
	}

	async analyticsTick() {
		const [numberOfMinions, totalSacrificed, numberOfIronmen, totalGP] = (
			await Promise.all(
				[
					`SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;`,
					`SELECT SUM ("sacrificedValue") AS count FROM users;`,
					`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;`,
					`SELECT SUM ("GP") AS count FROM users;`
				].map(query => this.client.query(query))
			)
		).map((result: any) => parseInt(result[0].count)) as number[];

		const taskCounts = this.calculateMinionTaskCounts();

		await AnalyticsTable.insert({
			guildsCount: this.client.guilds.size,
			membersCount: this.client.guilds.reduce((acc, curr) => (acc += curr.memberCount), 0),
			timestamp: Math.floor(Date.now() / 1000),
			clueTasksCount: taskCounts.clueTicker,
			minigameTasksCount: taskCounts.minigameTicker,
			monsterTasksCount: taskCounts.monsterKillingTicker,
			skillingTasksCount: taskCounts.skillingTicker,
			ironMinionsCount: numberOfIronmen,
			minionsCount: numberOfMinions,
			totalSacrificed,
			totalGP
		});
	}
}
