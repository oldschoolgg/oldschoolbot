import '../../src/lib/safeglobals.js';

import { rmSync } from 'node:fs';

export async function setup() {
	console.log(`Removing test DBs if they exist...`);
	for (const dir of ['./.db/osb-test', './.db/robochimp-test', './.db/bso-test']) {
		try {
			rmSync(dir, { recursive: true });
		} catch { }
	}
}
