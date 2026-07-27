import '../../src/lib/safeglobals.js';
import '../../scripts/execute-sql.js';

import { createDb } from '@/lib/globals.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

export default async function setup() {
	await createDb();
	return () => {
		exitCleanup();
	};
}
