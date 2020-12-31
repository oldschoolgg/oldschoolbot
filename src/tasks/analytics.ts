import { Task } from 'klasa';

import { Tasks } from '../lib/constants';
import { GroupMonsterActivityTaskOptions } from '../lib/minions/types';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { OldSchoolBotClient } from '../lib/structures/OldSchoolBotClient';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable';
import { ActivityTaskOptions, TickerTaskData } from '../lib/types/minions';
import { activityTaskFilter } from '../lib/util';
import { taskNameFromType } from '../lib/util/taskNameFromType';

export default class extends Task {
	async init() {
		await this.client.boss.schedule('analytics', `*/20 * * * *`);
		await this.client.boss.subscribe('analytics', async job => {
			await this.analyticsTick();
			job.done();
		});
		await this.client.boss.subscribe('minionActivity', async job => {
			const data = job.data as ActivityTaskOptions;
			const taskName = taskNameFromType(data.type);
			const task = this.client.tasks.get(taskName);
			try {
				this.client.oneCommandAtATimeCache.add(data.userID);
				await task?.run(data);
			} finally {
				this.client.oneCommandAtATimeCache.delete(data.userID);
				if ('users' in data) {
					for (const user of (data as GroupMonsterActivityTaskOptions).users) {
						(this.client as OldSchoolBotClient).minionActivityCache.delete(user);
					}
				} else {
					(this.client as OldSchoolBotClient).minionActivityCache.delete(data.userID);
				}
				job.done();
			}
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

			minionTaskCounts[taskName] = taskData.subTasks.length;
			for (const task of taskData.subTasks) {
				if ('users' in task) {
					minionTaskCounts[taskName] += task.users.length;
				}
			}
		}
		return minionTaskCounts;
	}

	generateTotalXPQuery() {
		const skillNames = Object.keys(this.client.user!.rawSkills);
		const columnNames = skillNames.map(val => `"skills.${val}"`);
		const query = `SELECT SUM(${columnNames.join(' + ')}) as count FROM users`;

		return query;
	}

	async analyticsTick() {
		const [numberOfMinions, totalSacrificed, numberOfIronmen, totalGP, totalXP] = (
			await Promise.all(
				[
					`SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;`,
					`SELECT SUM ("sacrificedValue") AS count FROM users;`,
					`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;`,
					`SELECT SUM ("GP") AS count FROM users;`,
					this.generateTotalXPQuery()
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
			totalGP,
			totalXP,
			dicingBank: this.client.settings.get(ClientSettings.EconomyStats.DicingBank),
			duelTaxBank: this.client.settings.get(ClientSettings.EconomyStats.DuelTaxBank),
			dailiesAmount: this.client.settings.get(ClientSettings.EconomyStats.DailiesAmount)
		});
	}
}
