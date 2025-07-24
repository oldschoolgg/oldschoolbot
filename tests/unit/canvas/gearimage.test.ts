import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EItem } from 'oldschooljs';
import { EGear } from 'oldschooljs/EGear';
import { describe, test } from 'vitest';

import { generateAllGearImage, generateGearImage } from '@/lib/canvas/generateGearImage';
import { COXMaxMeleeGear } from '@/lib/data/cox';
import { baseSnapshotPath } from '../utils';

describe('Gear Images', async () => {
	const gear = COXMaxMeleeGear.clone();
	gear.equip(EGear.DRAGON_ARROW, 100);
	test('Basic Gear Image', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: EItem.PHOENIX
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-basic.png'), gearImage);
	});

	test('All Gear Image', async () => {
		const gearImage = await generateAllGearImage({
			gear: {
				melee: gear,
				range: gear,
				mage: gear,
				other: gear,
				fashion: gear,
				skilling: gear,
				wildy: gear,
				misc: gear
			}
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-all.png'), gearImage);
	});
});
