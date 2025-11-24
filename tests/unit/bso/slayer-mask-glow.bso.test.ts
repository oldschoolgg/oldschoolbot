import { BSOItem } from '@/lib/bso/BSOItem.js';
import { maxMelee } from '@/lib/bso/depthsOfAtlantis.js';

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EItem } from 'oldschooljs';
import { describe, test } from 'vitest';

import { slayerMaskLeaderboardCache } from '@/lib/cache.js';
import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { generateGearImage } from '@/lib/canvas/generateGearImage.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { baseSnapshotPath } from '../../testConstants.js';
import { mockMUser } from '../userutil.js';

describe('BSO Slayer Mask Glowing', async () => {
	await bankImageTask.ready;

	test('Gear', async () => {
		const user = mockMUser();
		const gear = maxMelee.clone();
		gear.equip('Kurask slayer helm');
		slayerMaskLeaderboardCache.set(BSOItem.KURASK_SLAYER_HELM, user.id);

		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: EItem.PHOENIX,
			user
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-glowing-slayer-bso.png'), gearImage);

		const img = await makeBankImage({
			bank: gear.toBank(),
			user
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-glowing-slayer-bso.png'), img.buffer);
	});
});
