import { renderPaintGrid } from '@/lib/bso/canvas/renderPaintGrid.js';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { baseSnapshotPath } from '../../testConstants.js';

const snapshotPath = path.resolve(baseSnapshotPath, 'shiny-partycrab-paint-grid.png');

function isUpdatingSnapshots() {
	const state = expect.getState() as unknown as {
		snapshotState?: {
			_updateSnapshot?: string;
			updateSnapshot?: string;
		};
	};
	return [state.snapshotState?._updateSnapshot, state.snapshotState?.updateSnapshot].includes('all');
}

describe('Shiny Partycrab paint preview', () => {
	test('matches the paint grid snapshot', async () => {
		const preview = await renderPaintGrid({ item: Items.getOrThrow(73986) });

		if (isUpdatingSnapshots()) {
			await mkdir(path.dirname(snapshotPath), { recursive: true });
			await writeFile(snapshotPath, preview);
			return;
		}

		const snapshot = await readFile(snapshotPath);
		expect(Buffer.compare(preview, snapshot)).toBe(0);
	});
});
