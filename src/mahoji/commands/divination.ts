import { increaseNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import {
	divinationEnergies,
	getAllPortentCharges,
	MemoryHarvestType,
	memoryHarvestTypes,
	portents
} from '../../lib/bso/divination';
import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { MemoryHarvestOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { formatDuration } from '../../lib/util/smallUtils';
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
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'no_potion',
					description: 'Dont use divination potions'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'portent',
			description: 'View a portent.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'portent',
					description: 'The portent to view.',
					choices: portents.map(p => ({ name: p.item.name, value: p.item.name })),
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		harvest_memories?: { energy: string; type?: number; no_potion?: boolean };
		portent?: { portent: string };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.portent) {
			const portentCharges = await getAllPortentCharges(user);
			const portent = portents.find(p => p.item.name === options.portent!.portent);
			if (!portent) {
				return 'Invalid portent.';
			}
			return `**${portent.item.name}**
			
Description: ${portent.description}
Cost: ${portent.cost}

You have ${portentCharges[portent.id]} charges left, and you receive ${
				portent.chargesPerPortent
			} charges per portent used.`;
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

			if ('hasReq' in energy && energy.hasReq) {
				const unmetReason = energy.hasReq(user);
				if (unmetReason !== null) {
					return unmetReason;
				}
			}

			const potionBank = new Bank().add('Divination potion');
			const isUsingDivinationPotion = !options.harvest_memories.no_potion && user.owns(potionBank);

			let effectiveLevel = user.skillLevel('divination');
			if (isUsingDivinationPotion) {
				effectiveLevel += 10;
			}

			if (energy.level > effectiveLevel) {
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
				hasGuthixianBoost,
				hasDivineHand,
				isUsingDivinationPotion
			});

			if (
				method.id === MemoryHarvestType.ConvertWithEnergyToXP &&
				user.bank.amount(energy.item.id) < increaseNumByPercent(preEmptiveResult.cost.amount(energy.item.id), 5)
			) {
				return `You don't have enough ${energy.item.name} to convert with energy, get more or switch to a different harvest method.`;
			}

			if (isUsingDivinationPotion) {
				await user.removeItemsFromBank(potionBank);
			}

			await addSubTaskToActivityTask<MemoryHarvestOptions>({
				userID: user.id,
				channelID,
				duration,
				type: 'MemoryHarvest',
				e: energy.item.id,
				t: memoryHarvestMethodIndex,
				wb: hasWispBuster,
				dh: hasDivineHand,
				dp: isUsingDivinationPotion
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
