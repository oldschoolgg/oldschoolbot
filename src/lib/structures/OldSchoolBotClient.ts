import { Client, KlasaClientOptions } from 'klasa';
import { join } from 'path';
import { Connection, createConnection } from 'typeorm';

import { providerConfig } from '../../config';
import { clientOptions } from '../config';
import { getGuildSettings, syncActivityCache } from '../settings/settings';
import { piscinaPool } from '../workers';

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
	_emojis: any;

	public constructor(clientOptions: KlasaClientOptions) {
		super(clientOptions);
		this._emojis = super.emojis;
	}

	refreshEmojis() {
		this._emojis = super.emojis;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	get emojis() {
		return this._emojis;
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

		for (const guild of this.guilds.cache.values()) {
			getGuildSettings(guild);
		}

		await syncActivityCache();
		return super.login(token);
	}

	async fetchUser(id: string) {
		const user = await this.users.fetch(id);
		await user.settings.sync();
		return user;
	}

	init = () => {
		this.refreshEmojis();
	};
}
