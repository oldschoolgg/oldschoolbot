import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bank } from 'oldschooljs';
import { describe, test } from 'vitest';

import { bankImageTask } from '@/lib/canvas/bankImage';
import { baseSnapshotPath } from '../../testConstants.js';

describe('BSO Bank Images', async () => {
	test('Monkey/Dragon egg glow', async () => {
		const bank = new Bank().add('Dragon egg').add('Monkey egg');

		const { image } = await bankImageTask.generateBankImage({
			bank
		});
		await writeFile(path.join(baseSnapshotPath, 'bso-egg-glow.png'), image);
	});
});
