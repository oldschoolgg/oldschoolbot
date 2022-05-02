import { User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { defaultPatches } from '../../lib/minions/farming';
import { IPatchData } from '../../lib/minions/farming/types';
import { assert } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const farmingPatchNames = [
	'herb',
	'fruit_tree',
	'tree',
	'allotment',
	'hops',
	'cactus',
	'bush',
	'spirit',
	'hardwood',
	'seaweed',
	'vine',
	'calquat',
	'redwood',
	'crystal',
	'celastrus',
	'hespori',
	'flower',
	'mushroom',
	'belladonna'
] as const;

export type FarmingPatchName = typeof farmingPatchNames[number];

export function isPatchName(name: string): name is FarmingPatchName {
	return farmingPatchNames.includes(name as FarmingPatchName);
}

const farmingKeys: (keyof User)[] = farmingPatchNames.map(i => `farmingPatches_${i}` as const);

export function getFarmingKeyFromName(name: FarmingPatchName) {
	const key = farmingKeys.find(k => k.includes(name));
	if (!key) throw new Error('No farming key found');
	return key;
}

export async function getFarmingInfo(userID: bigint | string) {
	let keys: Partial<Record<keyof User, true>> = {};
	for (const key of farmingKeys) keys[key] = true;
	const userData = await mahojiUsersSettingsFetch(userID, keys);

	const patches: Record<FarmingPatchName, IPatchData> = {} as Record<FarmingPatchName, IPatchData>;

	for (const key of farmingKeys) {
		const patch: IPatchData = (userData[key] as IPatchData | null) ?? defaultPatches;
		const patchName: FarmingPatchName = key.replace('farmingPatches_', '') as FarmingPatchName;
		assert(farmingPatchNames.includes(patchName));
		patches[patchName] = patch;
	}

	return {
		patches
	};
}

export const farmingCommand: OSBMahojiCommand = {
	name: 'farming',
	description: 'Allows you to do Farming related things.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check_patches',
			description: 'The page in your bank you want to see.',
			required: false
		}
	],
	run: async ({ userID }: CommandRunOptions<{ page?: number }>) => {
		getFarmingInfo(userID);
		return 'Hi';
	}
};
