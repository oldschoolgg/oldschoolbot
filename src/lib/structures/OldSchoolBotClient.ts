import { Client } from 'discord.js';

import { allCommands } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends Client<true> {
	public busyCounterCache = new Map<string, number>();
	public isShuttingDown = false;
	public allCommands: OSBMahojiCommand[] = allCommands;

	_badgeCache: Map<string, string> = new Map();
}
