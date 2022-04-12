import { Client, KlasaClientOptions, KlasaUser } from 'klasa';

import { clientOptions } from '../config';
import { initCrons } from '../crons';
import { prisma } from '../settings/prisma';
import { syncActivityCache } from '../settings/settings';
import { startupScripts } from '../startupScripts';
import { logError } from '../util/logError';
import { piscinaPool } from '../workers';

const { production } = clientOptions;

if (typeof production !== 'boolean') {
	throw new Error('Must provide production boolean.');
}

import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');
import('../settings/schemas/ClientSchema');

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public piscinaPool = piscinaPool;
	public production = production ?? false;
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
		let promises = [];
		promises.push(syncActivityCache());
		promises.push(
			...startupScripts.map(query =>
				prisma
					.$queryRawUnsafe(query.sql)
					.catch(err =>
						query.ignoreErrors ? null : logError(`Startup script failed: ${err.message} ${query.sql}`)
					)
			)
		);
		await Promise.all(promises);
		return super.login(token);
	}

	async fetchUser(id: string | bigint): Promise<KlasaUser> {
		const user = await this.users.fetch(typeof id === 'string' ? id : id.toString());
		await user.settings.sync();
		return user;
	}

	init = () => {
		initCrons();
		this.refreshEmojis();
	};
}
