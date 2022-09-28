import { FSWatcher } from 'chokidar';
import { Client, ClientOptions, User } from 'discord.js';
import { FastifyInstance } from 'fastify';
import { MahojiClient } from 'mahoji';

import { production } from '../../config';
import { cacheUsernames } from '../../mahoji/commands/leaderboard';
import { initCrons } from '../crons';
import { runStartupScripts } from '../startupScripts';
import { syncActivityCache } from '../Task';
import { Peak } from '../tickers';
import { runTimedLoggedFn } from '../util';
import { syncActiveUserIDs } from '../util/cachedUserIDs';
import { piscinaPool } from '../workers';

if (typeof production !== 'boolean') {
	throw new Error('Must provide production boolean.');
}

export class OldSchoolBotClient extends Client {
	public busyCounterCache = new Map<string, number>();
	public piscinaPool = piscinaPool;
	public production = production ?? false;
	public mahojiClient!: MahojiClient;
	public isShuttingDown = false;
	_emojis: any;

	_fileChangeWatcher?: FSWatcher;
	_badgeCache: Map<string, string> = new Map();
	_peakIntervalCache!: Peak[];
	fastifyServer!: FastifyInstance;

	public constructor(clientOptions: ClientOptions) {
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
		promises.push(runTimedLoggedFn('Sync Activity Cache', syncActivityCache));
		promises.push(runTimedLoggedFn('Startup Scripts', runStartupScripts));
		promises.push(runTimedLoggedFn('Sync Active User IDs', syncActiveUserIDs));

		await Promise.all(promises);
		return super.login(token);
	}

	async fetchUser(id: string | bigint): Promise<User> {
		const user = await this.users.fetch(typeof id === 'string' ? id : id.toString());
		return user;
	}

	init = () => {
		initCrons(this);
		this.refreshEmojis();
		cacheUsernames();
	};
}
