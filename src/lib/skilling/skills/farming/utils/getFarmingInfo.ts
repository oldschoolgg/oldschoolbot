import { formatDuration, Time, toTitleCase } from '@oldschoolgg/toolkit';

import type { User } from '@/prisma/main.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { type FarmingPatchName, farmingPatchNames } from '@/lib/skilling/skills/farming/utils/farming.shared.js';
import { findPlant } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData, IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import { assert } from '@/lib/util/logError.js';

const farmingKeys: (keyof User)[] = farmingPatchNames.map(i => `farmingPatches_${i}` as const);

export function getFarmingInfoFromUser(user: MUser) {
	const patches: Record<FarmingPatchName, IPatchData> = {} as Record<FarmingPatchName, IPatchData>;
	const patchesDetailed: IPatchDataDetailed[] = [];

	const now = Date.now();

	for (const key of farmingKeys) {
		const patch: IPatchData = (user.user[key] as IPatchData | null) ?? Farming.defaultPatches;
		const patchName: FarmingPatchName = key.replace('farmingPatches_', '') as FarmingPatchName;
		assert(farmingPatchNames.includes(patchName));
		patches[patchName] = patch;

		const plant = findPlant(patch.lastPlanted) ?? null;
		if (patch.lastPlanted !== null && !plant) throw new Error(`No plant found for ${patch.lastPlanted}`);
		const difference = now - patch.plantTime;

		const ready = plant ? difference > plant.growthTime * Time.Minute : null;
		const readyAt = plant ? new Date(patch.plantTime + plant.growthTime * Time.Minute) : null;
		const readyIn = readyAt ? readyAt.getTime() - now : null;

		if (ready) {
			assert(readyAt !== null, "readyAt shouldn't be null if ready");
			assert(
				readyIn !== null && readyIn <= 0,
				`${patchName} readyIn should be less than 0 ready, received ${readyIn} ${formatDuration(readyIn!)}`
			);
		}
		if (ready === false) {
			assert(readyAt !== null, `readyAt should have value if growing, received ${readyAt}`);
			assert(readyAt !== null, `${patchName} readyIn should have value if growing, received ${readyAt}`);
		}
		if (ready === null) {
			assert(readyAt === null, 'No readyAt if null');
			assert(readyIn === null, 'No readyIn if null');
		}

		patchesDetailed.push({
			...patch,
			ready,
			readyIn,
			patchName,
			readyAt,
			friendlyName: toTitleCase(patchName.replace('_', ' ')),
			plant
		});
	}

	return {
		patches,
		patchesDetailed
	};
}
