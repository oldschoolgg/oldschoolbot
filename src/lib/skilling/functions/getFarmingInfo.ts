import { toTitleCase } from '@oldschoolgg/toolkit/util';
import type { User } from '@prisma/client';
import { Time } from 'e';

import { mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';
import { defaultPatches } from '../../minions/farming';
import type { IPatchData, IPatchDataDetailed } from '../../minions/farming/types';
import { assert, formatDuration } from '../../util';
import type { FarmingPatchName } from '../../util/farmingHelpers';
import { farmingKeys, farmingPatchNames, findPlant } from '../../util/farmingHelpers';

export function getFarmingInfoFromUser(user: User) {
	const patches: Record<FarmingPatchName, IPatchData> = {} as Record<FarmingPatchName, IPatchData>;
	const patchesDetailed: IPatchDataDetailed[] = [];

	const now = Date.now();

	for (const key of farmingKeys) {
		const patch: IPatchData = (user[key] as IPatchData | null) ?? defaultPatches;
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

export async function getFarmingInfo(userID: string) {
	const keys: Partial<Record<keyof User, true>> = {};
	for (const key of farmingKeys) keys[key] = true;
	const userData = await mahojiUsersSettingsFetch(userID, keys);
	return getFarmingInfoFromUser(userData as User);
}
