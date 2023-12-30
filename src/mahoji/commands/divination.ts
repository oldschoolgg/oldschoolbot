import { increaseNumByPercent, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { divinationEnergies, MemoryHarvestType, memoryHarvestTypes } from '../../lib/bso/divination';
import { GLOBAL_BSO_XP_MULTIPLIER } from '../../lib/constants';
import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { MemoryHarvestOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { formatDuration, returnStringOrFile } from '../../lib/util/smallUtils';
import { memoryHarvestResult } from '../../tasks/minions/bso/memoryHarvestActivity';
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
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'xphr',
			description: 'XP.',
			options: []
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ harvest_memories?: { energy: string; type?: number }; xphr?: {} }>) => {
		const user = await mUserFetch(userID);

		if (options.xphr) {
			let results = '';
			for (const energy of divinationEnergies) {
				for (const harvestMethod of memoryHarvestTypes) {
					for (const hasBoonAndWispBuster of [true, false]) {
						const res = memoryHarvestResult({
							duration: Time.Hour,
							energy,
							hasBoon: hasBoonAndWispBuster,
							harvestMethod: harvestMethod.id,
							hasWispBuster: hasBoonAndWispBuster,
							divinationLevel: user.skillLevel('divination')
						});
						results += [
							energy.type,
							harvestMethod.name,
							hasBoonAndWispBuster ? 'Has Boon+Wispbuster' : 'No boosts',
							res.avgPetTime / Time.Hour,
							res.totalDivinationXP * GLOBAL_BSO_XP_MULTIPLIER
						].join('\t');
						results += '\n';
					}
				}
			}

			return returnStringOrFile(results);
		}

		if (options.harvest_memories) {
			const memoryHarvestMethodIndex = options.harvest_memories.type ?? 0;
			const method = memoryHarvestTypes[memoryHarvestMethodIndex];
			if (!method) {
				return 'Invalid memory harvest method.';
			}

			const energy = divinationEnergies.find(e => e.type === options.harvest_memories!.energy);
			if (!energy) {
				return 'Invalid energy type.';
			}

			const duration = calcMaxTripLength(user, 'MemoryHarvest');

			const boosts: string[] = [];
			let hasWispBuster = false;
			if (user.hasEquipped('Wisp-buster')) {
				const boostResult = await inventionItemBoost({
					user,
					inventionID: InventionID.WispBuster,
					duration
				});
				if (boostResult.success) {
					boosts.push(
						`${inventionBoosts.wispBuster.memoryHarvestExtraYieldPercent}% extra yield for Wisp-buster (${boostResult.messages})`
					);
					hasWispBuster = true;
				}
			}

			const preEmptiveResult = memoryHarvestResult({
				duration,
				energy,
				harvestMethod: memoryHarvestMethodIndex,
				hasBoon: energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false,
				hasWispBuster,
				divinationLevel: user.skillLevel('divination')
			});

			if (
				method.id === MemoryHarvestType.ConvertWithEnergyToXP &&
				user.bank.amount(energy.item.id) < increaseNumByPercent(preEmptiveResult.totalMemoriesHarvested, 5) * 5
			) {
				return `You don't have enough ${energy.item.name} to convert with energy, get more or switch to a different harvest method.`;
			}

			await addSubTaskToActivityTask<MemoryHarvestOptions>({
				userID: user.id,
				channelID,
				duration,
				type: 'MemoryHarvest',
				e: energy.item.id,
				t: memoryHarvestMethodIndex,
				h: hasWispBuster
			});

			let str = `${user.minionName} is now harvesting ${energy.type} memories (${
				memoryHarvestTypes[memoryHarvestMethodIndex].name
			}), it'll take around ${formatDuration(duration)} to finish.`;
			if (boosts.length > 0) {
				str += `\n**Boosts:** ${boosts.join(', ')}`;
			}
			return str;
		}

		return 'Invalid command.';
	}
};
