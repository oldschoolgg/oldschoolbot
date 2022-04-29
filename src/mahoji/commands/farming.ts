import { User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { defaultPatches } from '../../lib/minions/farming';
import { IPatchData } from '../../lib/minions/farming/types';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

const farmingPatchNames = [
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

const farmingKeys: (keyof User)[] = farmingPatchNames.map(i => `farmingPatches_${i}` as const);

async function getFarmingInfo(userID: bigint) {
	const userData = await mahojiUsersSettingsFetch(userID, {
		farmingPatches_herb: true,
		farmingPatches_fruit_tree: true,
		farmingPatches_tree: true,
		farmingPatches_allotment: true,
		farmingPatches_hops: true,
		farmingPatches_cactus: true,
		farmingPatches_bush: true,
		farmingPatches_spirit: true,
		farmingPatches_hardwood: true,
		farmingPatches_seaweed: true,
		farmingPatches_vine: true,
		farmingPatches_calquat: true,
		farmingPatches_redwood: true,
		farmingPatches_crystal: true,
		farmingPatches_celastrus: true,
		farmingPatches_hespori: true,
		farmingPatches_flower: true,
		farmingPatches_mushroom: true,
		farmingPatches_belladonna: true
	});

	const patches = {};

	for (const key of farmingKeys) {
		const patch: IPatchData = (userData[key] as IPatchData | null) ?? defaultPatches;

		console.log(patch);
	}
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
