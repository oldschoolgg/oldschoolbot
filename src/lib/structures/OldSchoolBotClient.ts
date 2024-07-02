import type { User } from 'discord.js';
import { Client } from 'discord.js';
import type { FastifyInstance } from 'fastify';
import type { MahojiClient } from 'mahoji';

import { production } from '../../config';
import type { Peak } from '../tickers';

if (typeof production !== 'boolean') {
	throw new Error('Must provide production boolean.');
}

export class OldSchoolBotClient extends Client<true> {
	public busyCounterCache = new Map<string, number>();
	public production = production ?? false;
	public mahojiClient!: MahojiClient;
	public isShuttingDown = false;

	_badgeCache: Map<string, string> = new Map();
	_peakIntervalCache!: Peak[];
	fastifyServer!: FastifyInstance;

	async fetchUser(id: string | bigint): Promise<User> {
		const user = await this.users.fetch(typeof id === 'string' ? id : id.toString());
		return user;
	}
}
