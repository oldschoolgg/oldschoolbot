import { Client, KlasaClientOptions, KlasaUser } from 'klasa';

import { clientOptions } from '../config';
import { initCrons } from '../crons';
import { prisma } from '../settings/prisma';
import { getGuildSettings, syncActivityCache } from '../settings/settings';
import { startupScripts } from '../startupScripts';
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
		for (const guild of this.guilds.cache.values()) {
			getGuildSettings(guild);
		}

		let promises = [];
		promises.push(syncActivityCache());
		promises.push(
			...startupScripts.map(query =>
				prisma
					.$queryRawUnsafe(query)
					.catch(err => console.error(`Startup script failed: ${err.message} ${query}`))
			)
		);
		await Promise.all(promises);
		return super.login(token);
	}

	async fetchUser(id: string): Promise<KlasaUser> {
		const user = await this.users.fetch(id);
		await user.settings.sync();
		return user;
	}

	init = () => {
		initCrons();
		this.refreshEmojis();
	};
}
