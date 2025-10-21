import '../../src/lib/safeglobals.js';

import { createDb } from '@/lib/globals.js';
import { runStartupScripts } from '@/lib/startupScripts.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

export default async function setup() {
	await createDb();
	await runStartupScripts();
	return () => {
		exitCleanup();
	};
}
