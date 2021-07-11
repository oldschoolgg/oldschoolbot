import { Client as TagsClient } from '@kcp/tags';
import { Client, KlasaClientOptions } from 'klasa';
import { join } from 'path';
import { Connection, createConnection } from 'typeorm';

import { providerConfig } from '../../config';
import { clientOptions } from '../config';
import { syncActivityCache } from '../settings/settings';
import { piscinaPool } from '../workers';

Client.use(TagsClient);

const { production } = clientOptions;

if (typeof production !== 'boolean') {
	throw new Error('Must provide production boolean.');
}

const { port, user, password, database } = providerConfig!.postgres!;

import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');
import('../settings/schemas/ClientSchema');

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public piscinaPool = piscinaPool;
	public production = production ?? false;
	public orm!: Connection;

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

		await syncActivityCache();
		return super.login(token);
	}
}
