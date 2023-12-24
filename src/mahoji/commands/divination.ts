import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { divinationEnergies, MemoryHarvestType, memoryHarvestTypes } from '../../lib/bso/divination';
import { MemoryHarvestOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { formatDuration } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

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
					choices: divinationEnergies.map(e => ({ name: `${e.type} (Level ${e.level})`, value: e.type })),
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'type',
					description: 'The method of harvesting (default: convert to xp)',
					required: false,
					choices: [
						{
							name: 'Convert to XP (Default)',
							value: MemoryHarvestType.ConvertToXP
						},
						{
							name: 'Convert to Energy',
							value: MemoryHarvestType.ConvertToEnergy
						},
						{
							name: 'Convert to XP with Energy',
							value: MemoryHarvestType.ConvertWithEnergyToXP
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ harvest_memories?: { energy: string; type?: number } }>) => {
		const user = await mUserFetch(userID);

		if (options.harvest_memories) {
			const memoryHarvestMethodIndex = options.harvest_memories.type ?? 0;
			if (!memoryHarvestTypes[memoryHarvestMethodIndex]) {
				return 'Invalid memory harvest method.';
			}

			const energy = divinationEnergies.find(e => e.type === options.harvest_memories!.energy);
			if (!energy) {
				return 'Invalid energy type.';
			}
			const duration = calcMaxTripLength(user, 'MemoryHarvest');
			await addSubTaskToActivityTask<MemoryHarvestOptions>({
				userID: user.id,
				channelID,
				duration,
				type: 'MemoryHarvest',
				e: energy.item.id,
				t: memoryHarvestMethodIndex
			});

			return `${user.minionName} is now harvesting ${energy.type} memories (${
				memoryHarvestTypes[memoryHarvestMethodIndex].name
			}), it'll take around ${formatDuration(duration)} to finish.`;
		}

		return 'Invalid command.';
	}
};
