import { Client } from 'discord.js';

export class OldSchoolBotClient extends Client<true> {
	public busyCounterCache = new Map<string, number>();
	public isShuttingDown = false;

	_badgeCache: Map<string, string> = new Map();
}
