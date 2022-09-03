import { FSWatcher } from 'chokidar';
import { Client, ClientOptions, User } from 'discord.js';
import { FastifyInstance } from 'fastify';
import { MahojiClient } from 'mahoji';

import { production } from '../../config';
import { cacheUsernames } from '../../mahoji/commands/leaderboard';
import { Peak } from '../../tasks/WildernessPeakInterval';
import { initCrons } from '../crons';
import { prisma } from '../settings/prisma';
import { syncActivityCache } from '../settings/settings';
import { startupScripts } from '../startupScripts';
import { logError } from '../util/logError';
import { piscinaPool } from '../workers';

if (typeof production !== 'boolean') {
	throw new Error('Must provide production boolean.');
}

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public piscinaPool = piscinaPool;
	public production = production ?? false;
	public mahojiClient!: MahojiClient;
	_emojis: any;

	_fileChangeWatcher?: FSWatcher;
	_badgeCache!: Map<string, string>;
	_peakIntervalCache!: Peak[];
	fastifyServer!: FastifyInstance;
	minionTicker!: NodeJS.Timeout;
	dailyReminderTicker!: NodeJS.Timeout;
	giveawayTicker!: NodeJS.Timeout;
	analyticsInterval!: NodeJS.Timeout;
	metricsInterval!: NodeJS.Timeout;
	_presenceInterval!: NodeJS.Timeout;
	__farmingPatchReminders!: NodeJS.Timeout;
	__supportInterval!: NodeJS.Timeout;
	__dailyReminderInterval!: NodeJS.Timeout;
	__geInterval!: NodeJS.Timeout;

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
