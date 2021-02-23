import { Client as TagsClient } from '@kcp/tags';
import { Client, KlasaClientOptions } from 'klasa';
import pLimit from 'p-limit';
import { join } from 'path';
import { Connection, createConnection } from 'typeorm';

import { providerConfig } from '../../config';
import { clientOptions } from '../config/config';
import { initCustomItems } from '../customItems';
import { initItemAliases } from '../data/itemAliases';
import { ActivityTable } from '../typeorm/ActivityTable.entity';
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

	public minionActivityCache = new Map<string, ActivityTable['taskData']>();

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
			entities: [join(__dirname, '..', 'typeorm', '*.entity{.ts,.js}')],
			synchronize: !production
		});

		await this.syncActivityCache();

		return super.login(token);
	}

	public async syncActivityCache() {
		const tasks = await ActivityTable.find({
			where: {
				completed: false
			}
		});
		this.minionActivityCache.clear();
		for (const task of tasks) {
			for (const u of task.getUsers()) {
				this.minionActivityCache.set(u, task.taskData);
			}
		}
	}

	async cancelTask(userID: string) {
		await ActivityTable.delete({
			userID,
			completed: false
		});
		this.minionActivityCache.delete(userID);
	}

	public init = async (): Promise<this> => {
		initCustomItems();
		initItemAliases();
		return this;
	};
}
