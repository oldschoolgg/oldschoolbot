import type { MahojiClient } from '@oldschoolgg/toolkit/discord-util';
import { Client, type User } from 'discord.js';

export class OldSchoolBotClient extends Client<true> {
	public busyCounterCache = new Map<string, number>();
	public mahojiClient!: MahojiClient;
	public isShuttingDown = false;

	_badgeCache: Map<string, string> = new Map();

	async fetchUser(id: string | bigint): Promise<User> {
		const user = await this.users.fetch(typeof id === 'string' ? id : id.toString());
		return user;
	}
}
