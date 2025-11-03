import '../../src/lib/safeglobals.js';

import { createDb } from '@/lib/globals.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

await createDb();

global.globalClient = {
	isReady: () => true,
	emit: () => true,
	busyCounterCache: new Map<string, number>(),
	allCommands: allCommandsDONTIMPORT
} as any;
