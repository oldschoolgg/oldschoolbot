import { Client as TagsClient } from '@kcp/tags';
import { Client, KlasaClientOptions } from 'klasa';
import pLimit from 'p-limit';
import PgBoss from 'pg-boss';
import { Connection, createConnection } from 'typeorm';

import { providerConfig } from '../../config';
import PostgresProvider from '../../providers/postgres';
import { clientOptions } from '../config/config';
import { initItemAliases } from '../itemAliases';
import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { AnalyticsTable } from '../typeorm/AnalyticsTable';
import { ActivityTaskOptions } from '../types/minions';
import { piscinaPool } from '../workers';

Client.use(TagsClient);

import('../settings/schemas/ClientSchema');
import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');

const { production } = clientOptions;

if (typeof production !== 'boolean') {
	throw new Error(`Must provide production boolean.`);
}

const { port, user, password, database } = providerConfig!.postgres!;

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public queuePromise = pLimit(1);
	public piscinaPool = piscinaPool;
	public production = production ?? false;
	public orm!: Connection;
	public boss: PgBoss;

	public minionActivityCache = new Map<string, ActivityTaskOptions>();

	public constructor(clientOptions: KlasaClientOptions) {
		super(clientOptions);
		this.boss = new PgBoss({ ...providerConfig?.postgres });
		this.boss.on('error', error => console.error(error));
		this.once('login', async () => this.boss.start());
	}

	public async login(token?: string) {
		await this.boss.start();
		this.orm = await createConnection({
			type: 'postgres',
			host: 'localhost',
			port,
			username: user,
			password,
			database,
			entities: [AnalyticsTable],
			synchronize: true
		});
		await this.cacheDBMinionTasks();
		return super.login(token);
	}

	public async cacheDBMinionTasks() {
		const existingTasks = await (this.providers.default as PostgresProvider).runAll(
			`SELECT pgboss.job.data FROM pgboss.job WHERE pgboss.job.name = 'minionActivity' AND state = 'created';`
		);
		for (const task of existingTasks.map(t => t.data)) {
			if ('users' in task) {
				for (const user of (task as GroupMonsterActivityTaskOptions).users) {
					this.minionActivityCache.set(user, task);
				}
			} else {
				this.minionActivityCache.set(task.userID, task);
			}
		}
	}

	public init = async (): Promise<this> => {
		initItemAliases();
		return this;
	};
}
