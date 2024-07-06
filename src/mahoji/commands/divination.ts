import { mentionCommand } from '@oldschoolgg/toolkit';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, increaseNumByPercent, removeFromArr } from 'e';
import { Bank } from 'oldschooljs';

import {
	MemoryHarvestType,
	basePortentCost,
	divinationEnergies,
	getAllPortentCharges,
	memoryHarvestTypes,
	portents
} from '../../lib/bso/divination';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';

import type { MemoryHarvestOptions } from '../../lib/types/minions';
import { assert } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { formatDuration } from '../../lib/util/smallUtils';
import { memoryHarvestResult, totalTimePerRound } from '../../tasks/minions/bso/memoryHarvestActivity';
import type { OSBMahojiCommand } from '../lib/util';

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
					name: 'view',
					description: 'The portent to view.',
					choices: [
						{ name: 'All', value: 'all' },
						...portents.map(p => ({ name: p.item.name, value: p.item.name }))
					],
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'charge_portent',
			description: 'Charge a portent.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'portent',
					description: 'The portent to charge.',
					choices: portents.map(p => ({ name: p.item.name, value: p.item.name })),
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity of portents to consume for charges.',
					min_value: 1,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'toggle_portent',
			description: 'Toggle a portent on/off.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'portent',
					description: 'The portent to toggle.',
					choices: portents.map(p => ({ name: p.item.name, value: p.item.name })),
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{
		harvest_memories?: { energy: string; type?: number; no_potion?: boolean };
		portent?: { view: string };
		charge_portent?: { portent: string; quantity: number };
		toggle_portent?: { portent: string };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.toggle_portent) {
			const portent = portents.find(p => p.item.name === options.toggle_portent!.portent);
			if (!portent) {
				return 'Invalid portent.';
			}
			let newDisabledPortents = user.user.disabled_portent_ids;
			if (newDisabledPortents.includes(portent.id)) {
				newDisabledPortents = removeFromArr(newDisabledPortents, portent.id);
			} else {
				newDisabledPortents.push(portent.id);
			}
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					disabled_portent_ids: newDisabledPortents
				}
			});
			return `Toggled ${portent.item.name} ${newDisabledPortents.includes(portent.id) ? 'off' : 'on'}.`;
		}

		if (options.charge_portent) {
			const portent = portents.find(p => p.item.name === options.charge_portent!.portent);
			if (!portent) {
				return 'Invalid portent.';
			}
			const cost = new Bank();
			cost.add(portent.item.id, options.charge_portent.quantity);
			if (!user.owns(cost)) {
				return `You don't own ${cost}.`;
			}
			assert(options.charge_portent.quantity > 0);
			const chargesToGet = options.charge_portent.quantity * portent.chargesPerPortent;
			if (options.charge_portent.quantity > 1) {
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to consume ${cost} for ${chargesToGet}x charges?`
				);
			}
			await user.removeItemsFromBank(cost);
			const newPortent = await prisma.portent.upsert({
				where: {
					item_id_user_id: {
						user_id: user.id,
						item_id: portent.item.id
					}
				},
				update: {
					charges_remaining: {
						increment: chargesToGet
					},
					total_charges: {
						increment: chargesToGet
					}
				},
				create: {
					user_id: user.id,
					item_id: portent.item.id,
					charges_remaining: chargesToGet,
					total_charges: chargesToGet
				}
			});
			return portent.addChargeMessage(newPortent);
		}

		if (options.portent) {
			const portentCharges = await getAllPortentCharges(user);
			const portent = portents.find(p => p.item.name === options.portent!.view);
			if (!portent) {
				let str = 'All Your Portents:\n\n';
				for (const p of portents) {
					str += `**${p.item.name}:** ${portentCharges[p.id]} charges remaining (Toggled ${
						user.user.disabled_portent_ids.includes(p.id) ? 'Off' : 'On'
					})\n`;
				}

				str += `\n\nYou can get more charges by buying/creating a portent item, then using it with ${mentionCommand(
					globalClient,
					'divination',
					'charge_portent'
				)}.`;
				return str;
			}
			return `**${portent.item.name}**
			
Description: ${portent.description}
Cost: ${portent.cost} and base cost of ${basePortentCost}
You have this portent toggled ${user.user.disabled_portent_ids.includes(portent.id) ? 'off' : 'on'}.

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
			const boosts: string[] = [];

			let maxTripLength = calcMaxTripLength(user, 'MemoryHarvest');

			if (user.hasEquipped('Jar of memories')) {
				maxTripLength += Time.Minute * 7;
				boosts.push('7mins extra trip length for Jar of memories');
			}

			let hasWispBuster = false;
			let hasDivineHand = false;

			const shouldAttemptToUseDivineHand =
				user.hasEquipped('Divine hand') ||
				(user.bank.has('Divine hand') && method.id === MemoryHarvestType.ConvertToEnergy);
			const shouldAttemptToUseWispBuster = user.hasEquipped('Wisp-buster') || !shouldAttemptToUseDivineHand;

			if (shouldAttemptToUseWispBuster) {
				const boostResult = await inventionItemBoost({
					user,
					inventionID: InventionID.WispBuster,
					duration: maxTripLength
				});
				if (boostResult.success) {
					boosts.push(
						`${inventionBoosts.wispBuster.xpIncreasePercent}% extra XP for Wisp-buster (${boostResult.messages})`
					);
					hasWispBuster = true;
				}
			} else if (shouldAttemptToUseDivineHand) {
				const boostResult = await inventionItemBoost({
					user,
					inventionID: InventionID.DivineHand,
					duration: maxTripLength
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

			const totalSeconds = Math.round(maxTripLength / Time.Second);
			const rounds = Math.floor(totalSeconds / totalTimePerRound);
			const duration = rounds * totalTimePerRound * Time.Second;

			const preEmptiveResult = memoryHarvestResult({
				duration,
				energy,
				harvestMethod: memoryHarvestMethodIndex,
				hasBoon: energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false,
				hasWispBuster,
				hasGuthixianBoost,
				hasDivineHand,
				isUsingDivinationPotion,
				hasMasterCape: false,
				rounds
			});

			if (
				method.id === MemoryHarvestType.ConvertWithEnergyToXP &&
				user.bank.amount(energy.item.id) < increaseNumByPercent(preEmptiveResult.cost.amount(energy.item.id), 5)
			) {
				return `${user}, You don't have enough ${energy.item.name} to convert with energy, get more or switch to a different harvest method.`;
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
				dp: isUsingDivinationPotion,
				r: rounds
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
