import { Task } from 'klasa';
import { createConnection } from 'typeorm';

import { providerConfig } from '../config';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { AnalyticsTable } from '../lib/typeorm/AnalyticsTable';

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

		const boss = this.client.pgBoss.getPgBoss();
		boss.on('error', error => console.error(error));
		await boss.schedule('analytics', `*/20 * * * *`);
		await boss.subscribe('analytics', async job => {
			await this.analyticsTick();
			job.done();
		});
	}

	async run() {
		this.analyticsTick();
	}

	async calculateMinionTaskCounts() {
		return this.client.pgBoss.getRunningJobs();
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
			clueTasksCount: taskCounts.clueEvent,
			minigameTasksCount: taskCounts.minigameEvent,
			monsterTasksCount: taskCounts.monsterKillingEvent,
			skillingTasksCount: taskCounts.skillingEvent,
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
