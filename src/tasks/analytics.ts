import { Time } from 'e';
import { Task } from 'klasa';
import { createQueryBuilder, MoreThan } from 'typeorm';

import { production } from '../config';
import { ActivityGroup } from '../lib/constants';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable.entity';
import { GroupMonsterActivityTaskOptions } from '../lib/types/minions';
import { taskGroupFromActivity } from '../lib/util/taskGroupFromActivity';

export default class extends Task {
	async init() {
		if (this.client.analyticsInterval) {
			clearInterval(this.client.analyticsInterval);
		}
		this.client.analyticsInterval = setInterval(this.analyticsTick.bind(this), Time.Minute * 5);

		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(ActivityTable).select().where('completed = false');
				if (production) {
					query.andWhere(`finish_date < now()`);
				}
				const result = await query.getMany();
				await Promise.all(result.map(t => t.complete()));
			} catch (err) {
				console.error(err);
			} finally {
				this.client.minionTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
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

		const currentTasks = await ActivityTable.find({
			where: {
				completed: false,
				finishDate: MoreThan('now()')
			}
		});

		for (const task of currentTasks) {
			const group = taskGroupFromActivity(task.type);

			if (task.groupActivity) {
				minionTaskCounts[
					group
				] += (task.data as GroupMonsterActivityTaskOptions).users.length;
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
