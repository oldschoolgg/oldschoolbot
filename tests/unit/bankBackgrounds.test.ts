import fs from 'node:fs';
import { describe, expect, test } from 'vitest';

import backgroundImages from '../../src/lib/minions/data/bankBackgrounds';

describe('Bank Backgrounds', () => {
	test('Image should exist', async () => {
		for (const bg of backgroundImages) {
			if (bg.id === 1) continue;
			const path = `./src/lib/resources/images/bank_backgrounds/${bg.id}.${bg.transparent ? 'png' : 'jpg'}`;
			const exists = fs.existsSync(path);
			if (!exists) {
				throw new Error(`${path} does not exist`);
			}
		}
	});
	test('No duplicate ids', async () => {
		expect(backgroundImages.length).toBe(new Set(backgroundImages.map(bg => bg.id)).size);
	});
});
