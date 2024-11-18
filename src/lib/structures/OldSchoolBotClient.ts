import type { MahojiClient } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { Client } from 'discord.js';

import type { Peak } from '../tickers';

export class OldSchoolBotClient extends Client<true> {
	public busyCounterCache = new Map<string, number>();
	public mahojiClient!: MahojiClient;
	public isShuttingDown = false;

	_badgeCache: Map<string, string> = new Map();
	_peakIntervalCache!: Peak[];

	async fetchUser(id: string | bigint): Promise<User> {
		const user = await this.users.fetch(typeof id === 'string' ? id : id.toString());
		return user;
	}
}
