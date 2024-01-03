import { increaseNumByPercent, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { divinationEnergies, MemoryHarvestType, memoryHarvestTypes } from '../../lib/bso/divination';
import { GLOBAL_BSO_XP_MULTIPLIER } from '../../lib/constants';
import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { MemoryHarvestOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { calcPerHour, formatDuration, returnStringOrFile } from '../../lib/util/smallUtils';
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
			let results = `${[
				'Type',
				'Method',
				'Boosts',
				'Pet Time (Hours)',
				'XP/Hr',
				'Memories/HR',
				'GMC/hr',
				'MC/hr',
				'EnergyLoot/hr',
				'EnergyCost/hr'
			].join('\t')}\n`;
			for (const energy of divinationEnergies) {
				for (const harvestMethod of memoryHarvestTypes) {
					for (const hasBoonAndWispBusterAndGuthixianBoost of [true, false]) {
						const res = memoryHarvestResult({
							duration: Time.Hour,
							energy,
							hasBoon: hasBoonAndWispBusterAndGuthixianBoost,
							harvestMethod: harvestMethod.id,
							divinationLevel: user.skillLevel('divination'),
							hasGuthixianBoost: hasBoonAndWispBusterAndGuthixianBoost,
							hasDivineHand: hasBoonAndWispBusterAndGuthixianBoost,
							hasWispBuster: hasBoonAndWispBusterAndGuthixianBoost
						});

						results += [
							energy.type,
							harvestMethod.name,
							hasBoonAndWispBusterAndGuthixianBoost ? 'Has Boon+Wispbuster+GuthixianBoost' : 'No boosts',
							res.avgPetTime / Time.Hour,
							res.totalDivinationXP * GLOBAL_BSO_XP_MULTIPLIER,
							calcPerHour(res.totalMemoriesHarvested, Time.Hour),
							calcPerHour(res.loot.amount('Clue scroll (grandmaster)'), Time.Hour),
							calcPerHour(res.loot.amount('Clue scroll (master)'), Time.Hour),
							calcPerHour(res.loot.amount(energy.item.id), Time.Hour),
							calcPerHour(res.cost.amount(energy.item.id), Time.Hour)
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

			if (energy.level > user.skillLevel('divination')) {
				return `You need ${energy.level} divination to harvest ${energy.type} memories.`;
			}

			const duration = calcMaxTripLength(user, 'MemoryHarvest');

			const boosts: string[] = [];
			let hasWispBuster = false;
			let hasDivineHand = false;
			if (user.hasEquipped('Wisp-buster')) {
				const boostResult = await inventionItemBoost({
					user,
					inventionID: InventionID.WispBuster,
					duration
				});
				if (boostResult.success) {
					boosts.push(
						`${inventionBoosts.wispBuster.xpIncreasePercent}% extra XP for Wisp-buster (${boostResult.messages})`
					);
					hasWispBuster = true;
				}
			} else if (user.hasEquipped('Divine hand')) {
				const boostResult = await inventionItemBoost({
					user,
					inventionID: InventionID.DivineHand,
					duration
				});
				if (boostResult.success) {
					boosts.push(
						`${inventionBoosts.divineHand.memoryHarvestExtraYieldPercent}% extra energy yield and Clue scrolls for Divine hand (${boostResult.messages})`
					);
					hasDivineHand = true;
				}
			}

			const hasGuthixianBoost = user.user.guthixian_cache_boosts_available > 0;

			if (hasGuthixianBoost) {
				boosts.push('20% extra XP for Guthixian Cache boost');
			}

			const preEmptiveResult = memoryHarvestResult({
				duration,
				energy,
				harvestMethod: memoryHarvestMethodIndex,
				hasBoon: energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false,
				hasWispBuster,
				divinationLevel: user.skillLevel('divination'),
				hasGuthixianBoost,
				hasDivineHand
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
				wb: hasWispBuster,
				dh: hasDivineHand
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
