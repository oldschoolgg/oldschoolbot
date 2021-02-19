import { Client as TagsClient } from '@kcp/tags';
import { Client, KlasaClientOptions } from 'klasa';
import pLimit from 'p-limit';
import { join } from 'path';
import PgBoss from 'pg-boss';
import { Connection, createConnection } from 'typeorm';

import { providerConfig } from '../../config';
import { clientOptions } from '../config/config';
import { initItemAliases } from '../data/itemAliases';
import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { ActivityTaskOptions } from '../types/minions';
import { piscinaPool } from '../workers';

Client.use(TagsClient);

const { production } = clientOptions;

if (typeof production !== 'boolean') {
	throw new Error(`Must provide production boolean.`);
}

const { port, user, password, database } = providerConfig!.postgres!;

import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');
import('../settings/schemas/ClientSchema');

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public queuePromise = pLimit(1);
	public piscinaPool = piscinaPool;
	public production = production ?? false;
	public orm!: Connection;
	public boss!: PgBoss;

	public minionActivityCache = new Map<string, ActivityTaskOptions>();

	public constructor(clientOptions: KlasaClientOptions) {
		super(clientOptions);
	}

	public async login(token?: string) {
		this.orm = await createConnection({
			type: 'postgres',
			host: 'localhost',
			port,
			username: user,
			password,
			database,
			entities: [join(__dirname, 'src', 'lib', 'typeorm', '*.entity{.ts,.js}')],
			synchronize: !production
		});
		const existingTasks = await this.orm.query(
			`SELECT pgboss.job.data FROM pgboss.job WHERE pgboss.job.name = 'minionActivity' AND state = 'created';`
		);

		for (const task of existingTasks.map((t: any) => t.data)) {
			if ('users' in task) {
				for (const user of (task as GroupMonsterActivityTaskOptions).users) {
					this.minionActivityCache.set(user, task);
				}
			} else {
				this.minionActivityCache.set(task.userID, task);
			}
		}

		this.boss = new PgBoss({ ...providerConfig?.postgres, deleteAfterHours: 2 });
		this.boss.on('error', error => console.error(error));
		await this.boss.start();

		return super.login(token);
	}

	async cancelTask(userID: string) {
		await this.orm.query(
			`DELETE FROM pgboss.job WHERE pgboss.job.name = 'minionActivity' AND cast(pgboss.job.data->>'userID' as text) = '${userID}' AND state = 'created';`
		);
		this.minionActivityCache.delete(userID);
	}

	public init = async (): Promise<this> => {
		initItemAliases();
		return this;
	};
}
