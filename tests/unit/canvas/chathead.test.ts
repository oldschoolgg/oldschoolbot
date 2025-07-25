import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, test } from 'vitest';

import { mahojiChatHead } from '@/lib/canvas/chatHeadImage';
import { baseSnapshotPath } from '../testConstants';

describe('Chathead Images', async () => {
	test('Basic', async () => {
		const result = await mahojiChatHead({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		await writeFile(path.join(baseSnapshotPath, 'chathead.png'), result.files[0].attachment);
	});
});
