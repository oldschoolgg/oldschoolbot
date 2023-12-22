import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { divinationEnergies } from '../../lib/bso/divination';
import { MemoryHarvestOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { OSBMahojiCommand } from '../lib/util';

const memoryHarvestTypes = ['convert to xp', 'convert to energy', 'convert with energy to xp'];

export const divinationCommand: OSBMahojiCommand = {
	name: 'divination',
	description: 'The divination skill.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'harvest_memories',
			description: 'Harvest memories to gain XP.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'energy',
					description: 'The type of memory.',
					choices: divinationEnergies.map(e => ({ name: e.type, value: e.type })),
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The method of harvesting (default: convert to xp)',
					required: false,
					choices: memoryHarvestTypes.map(e => ({ name: e, value: e }))
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ harvest_memories?: { energy: string; type?: string } }>) => {
		const user = await mUserFetch(userID);

		if (options.harvest_memories) {
			const memoryHarvestMethod = options.harvest_memories.type ?? memoryHarvestTypes[0];
			if (!memoryHarvestTypes.includes)
				await addSubTaskToActivityTask<MemoryHarvestOptions>({
					userID: user.id,
					channelID,
					duration: calcMaxTripLength(user, 'MemoryHarvest'),
					type: 'MemoryHarvest',
					e: options.harvest_memories.energy,
					t: options.harvest_memories.type
				});
		}

		return str;
	}
};
