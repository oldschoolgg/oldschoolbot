import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, test } from 'vitest';

import { bankImageTask } from '@/lib/canvas/bankImage';
import { pohImageGenerator } from '@/lib/canvas/pohImage';
import { baseSnapshotPath } from '../../testConstants.js';

describe('POH Image', async () => {
	await bankImageTask.ready;
	test('Basic POH Image', async () => {
		const result = await pohImageGenerator.run({
			prayer_altar: 13_197,
			throne: 13_667,
			torch: 13_342,
			mounted_cape: 29_210,
			background_id: 1
		} as any);

		await writeFile(path.join(baseSnapshotPath, 'poh-basic.png'), result);
	});
});
