import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EItem } from 'oldschooljs';
import { describe, test } from 'vitest';

import { bankImageTask } from '@/lib/canvas/bankImage';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas';
import { baseSnapshotPath } from '../../testConstants.js';

describe('OSRSCanvas', async () => {
	await bankImageTask.ready;
	test('Basic Bank Image', async () => {
		const c = new OSRSCanvas({ width: 500, height: 500 });
		const ctx = c.ctx;
		const bgSprite = bankImageTask.getBgAndSprite();
		ctx.fillStyle = ctx.createPattern(bgSprite.sprite.repeatableBg, 'repeat')!;
		ctx.fillRect(0, 0, c.width, c.height);
		await c.drawItemIDSprite({
			itemID: EItem.TWISTED_BOW,
			x: 250,
			y: 250,
			glow: {
				color: OSRSCanvas.COLORS.PURPLE,
				blur: 50,
				radius: 15
			}
		});

		await writeFile(path.join(baseSnapshotPath, 'osrs-canvas-glow.png'), await c.toBuffer());
	});
});
