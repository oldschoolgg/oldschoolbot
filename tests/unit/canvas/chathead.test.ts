import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, test } from 'vitest';

import chatHeadImage from '@/lib/canvas/chatHeadImage.js';
import { baseSnapshotPath } from '../../testConstants.js';

describe('Chathead Images', async () => {
	test('Basic', async () => {
		const result = await chatHeadImage({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		await writeFile(path.join(baseSnapshotPath, 'chathead.png'), result.buffer);
	});
});
