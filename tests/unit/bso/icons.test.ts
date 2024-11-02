import { readdir } from 'node:fs/promises';
import { test } from 'vitest';

import { customItems } from '../../../src/lib/customItems/util';
import spriteSheetData from '../../../src/lib/resources/images/bso_spritesheet.json';

test('BSO Icons', async () => {
	const files = new Set(await readdir('src/lib/resources/images/bso_icons'));
	const missing = new Set();
	for (const item of customItems) {
		if (!files.has(`${item}.png`)) {
			missing.add(item);
		}
		files.delete(`${item}.png`);
	}

	// for (const file of files) {
	// throw new Error(`Unused icon: ${file}`);
	// }

	if (missing.size > 0) {
		throw new Error(`Missing icons: ${[...missing].map(i => `${i}.png`).join('|')}`);
	}

	for (const item of customItems) {
		if (!(spriteSheetData as any)[item]) {
			throw new Error(`Missing data for ${item}.png in spritesheet`);
		}
	}
});
