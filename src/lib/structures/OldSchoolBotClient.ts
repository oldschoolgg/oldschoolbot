import { Client } from 'discord.js';

import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends Client<true> {
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;

	_badgeCache: Map<string, string> = new Map();
}
