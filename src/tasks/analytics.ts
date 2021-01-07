import { Task } from 'klasa';

import { ActivityGroup } from '../lib/constants';
import { GroupMonsterActivityTaskOptions } from '../lib/minions/types';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { OldSchoolBotClient } from '../lib/structures/OldSchoolBotClient';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable.entity';
import { ActivityTaskOptions } from '../lib/types/minions';
import { taskGroupFromActivity } from '../lib/util/taskGroupFromActivity';
import { taskNameFromType } from '../lib/util/taskNameFromType';

export default class extends Task {
	async init() {
		await this.client.boss.schedule('analytics', `*/20 * * * *`);
		await this.client.boss.subscribe('analytics', async job => {
			await this.analyticsTick();
			job.done();
		});
		await this.client.boss.subscribe(
			'minionActivity',
			{
				teamSize: 10,
				teamConcurrency: 10
			},
			async job => {
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
			}
		);
	}

	async run() {
		this.analyticsTick();
	}

	async calculateMinionTaskCounts() {
		const minionTaskCounts: Record<ActivityGroup, number> = {
			[ActivityGroup.Clue]: 0,
			[ActivityGroup.Minigame]: 0,
			[ActivityGroup.Monster]: 0,
			[ActivityGroup.Skilling]: 0
		};

		const tasks: {
			data: ActivityTaskOptions | GroupMonsterActivityTaskOptions;
		}[] = await this.client.query(
			`SELECT pgboss.job.data FROM pgboss.job WHERE pgboss.job.name = 'minionActivity' AND state = 'created';`
		);

		for (const task of tasks.map(t => t.data)) {
			const group = taskGroupFromActivity(task.type);

			if ('users' in task) {
				minionTaskCounts[group] += task.users.length;
			} else {
				minionTaskCounts[group] += 1;
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

		const taskCounts = await this.calculateMinionTaskCounts();

		await AnalyticsTable.insert({
			guildsCount: this.client.guilds.size,
			membersCount: this.client.guilds.reduce((acc, curr) => (acc += curr.memberCount), 0),
			timestamp: Math.floor(Date.now() / 1000),
			clueTasksCount: taskCounts.Clue,
			minigameTasksCount: taskCounts.Minigame,
			monsterTasksCount: taskCounts.Monster,
			skillingTasksCount: taskCounts.Skilling,
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
