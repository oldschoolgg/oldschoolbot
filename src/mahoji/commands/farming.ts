import { EmbedBuilder } from '@oldschoolgg/discord';
import { stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import { choicesOf } from '@/discord/index.js';
import { autoFarm } from '@/lib/minions/functions/autoFarm.js';
import {
	compostBinPlantNameAutoComplete,
	farmingPlantNameAutoComplete,
	titheFarmBuyRewardAutoComplete
} from '@/lib/skilling/skills/farming/autocompletes.js';
import {
	getPlantsForPatch,
	getPrimarySeedForPlant,
	parsePreferredSeeds,
	serializePreferredSeeds
} from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { CompostTiers, Farming } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { FarmingSeedPreference } from '@/lib/skilling/skills/farming/utils/types.js';
import { ContractOptions } from '@/lib/skilling/skills/farming/utils/types.js';
import {
	compostBinCommand,
	farmingPlantCommand,
	harvestCommand
} from '@/mahoji/lib/abstracted_commands/farmingCommand.js';
import { farmingContractCommand } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { titheFarmCommand, titheFarmShopCommand } from '@/mahoji/lib/abstracted_commands/titheFarmCommand.js';

const autoFarmFilterTexts: Record<AutoFarmFilterEnum, string> = {
	AllFarm: 'All crops will be farmed with the highest available seed',
	Replant: 'Only planted crops will be replanted, using the same seed'
};

function formatPreference(preference: FarmingSeedPreference | undefined): string {
	if (!preference) {
		return 'not set (uses auto farm filter)';
	}
	if (preference.type === 'highest_available') {
		return 'highest_available';
	}
	if (preference.type === 'empty') {
		return 'empty';
	}
	const item = Items.getItem(preference.seedID);
	const itemName = item?.name ?? `Item ${preference.seedID}`;
	return `seed: ${itemName}`;
}

function buildPreferencesEmbed(
	patchesDetailed: ReturnType<typeof Farming.getFarmingInfoFromUser>['patchesDetailed'],
	preferences: Map<FarmingPatchName, FarmingSeedPreference>,
	preferContract: boolean
): EmbedBuilder {
	const descriptionLines: string[] = [`Contract priority: ${preferContract ? 'enabled' : 'disabled'}.`];
	for (const patch of patchesDetailed) {
		descriptionLines.push(`${patch.friendlyName} → ${formatPreference(preferences.get(patch.patchName))}`);
	}

	return new EmbedBuilder().setTitle('Auto-farm preferences').setDescription(descriptionLines.join('\n'));
}

function resolveSeedPreferenceInput(patchName: FarmingPatchName, seedInput: string): FarmingSeedPreference | string {
	const trimmed = seedInput.trim();
	if (trimmed.length === 0) {
		return 'Please specify a seed preference.';
	}
	const normalized = trimmed.toLowerCase().replace(/\s+/g, '_');
	if (normalized === 'highest_available') {
		return { type: 'highest_available' };
	}
	if (normalized === 'empty') {
		return { type: 'empty' };
	}

	const plantsForPatch = getPlantsForPatch(patchName);
	let matchingPlant = plantsForPatch.find(
		plant => stringMatches(plant.name, trimmed) || plant.aliases.some(alias => stringMatches(alias, trimmed))
	);

	if (!matchingPlant) {
		matchingPlant = plantsForPatch.find(plant =>
			plant.inputItems
				.items()
				.some(([item]) => stringMatches(item.name, trimmed) || stringMatches(item.name, normalized))
		);
	}

	if (!matchingPlant) {
		return `I couldn't find a seed or plant matching "${seedInput}" for that patch.`;
	}

	const seedID = getPrimarySeedForPlant(matchingPlant);
	if (!seedID) {
		return `Unable to determine the seed item for ${matchingPlant.name}.`;
	}

	return { type: 'seed', seedID };
}

export const farmingCommand = defineCommand({
	name: 'farming',
	description: 'Allows you to do Farming related things.',
	options: [
		{
			type: 'Subcommand',
			name: 'check_patches',
			description: 'The page in your bank you want to see.',
			required: false
		},
		{
			type: 'Subcommand',
			name: 'plant',
			description: 'Allows you to plant seeds and train Farming.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'plant_name',
					description: 'The plant you want to plant.',
					required: true,
					autocomplete: farmingPlantNameAutoComplete
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity you want to plant.',
					required: false,
					min_value: 1
				},
				{
					type: 'Boolean',
					name: 'pay',
					description: 'Pay farmers for protection.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'auto_farm',
			description: 'Automatically farm any available things you can do.',
			required: false
		},
		{
			type: 'Subcommand',
			name: 'auto_farm_filter',
			description: 'Set which auto farm filter you want to use by default.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'auto_farm_filter_data',
					description: 'The auto farm filter you want to use by default. (default: AllFarm)',
					required: true,
					choices: choicesOf(Object.values(AutoFarmFilterEnum))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'set_preferred',
			description: 'View or update your per-patch autofarm preferences.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'patch',
					description: 'The patch to view or modify.',
					required: false,
					choices: Farming.farmingPatchNames.map(name => ({
						name: toTitleCase(name.replace(/_/g, ' ')),
						value: name
					}))
				},
				{
					type: 'String',
					name: 'seed',
					description: "Preferred seed (item name, 'highest_available', or 'empty').",
					required: false
				},
				{
					type: 'Boolean',
					name: 'prefer_contract',
					description: 'Prioritize farming contracts when available.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'default_compost',
			description: 'Set which compost you want to use by default.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'compost',
					description: 'The compost you want to use by default.',
					required: true,
					choices: CompostTiers.map(i => ({ name: i.item.name, value: i.item.name }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'always_pay',
			description: 'Toggle always paying farmers for protection.',
			required: false
		},
		{
			type: 'Subcommand',
			name: 'harvest',
			description: 'Allows you to harvest patches without replanting.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'patch_name',
					description: 'The patches you want to harvest.',
					required: true,
					choices: Farming.farmingPatchNames.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'tithe_farm',
			description: 'Allows you to do the Tithe Farm minigame.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'buy_reward',
					description: 'Buy a Tithe Farm reward.',
					required: false,
					autocomplete: titheFarmBuyRewardAutoComplete
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'compost_bin',
			description: 'Allows you to make compost from crops.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'plant_name',
					description: 'The plant you want to put in the Compost Bins.',
					required: true,
					autocomplete: compostBinPlantNameAutoComplete
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity you want to put in.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'contract',
			description: 'Allows you to do Farming Contracts.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'input',
					description: 'The input you want to give.',
					required: false,
					choices: choicesOf(ContractOptions)
				}
			]
		}
	],
	run: async ({ user, options, interaction, channelId }) => {
		await interaction.defer();
		const { patchesDetailed, patches } = Farming.getFarmingInfoFromUser(user);

		if (options.auto_farm) {
			return autoFarm(user, patchesDetailed, patches, interaction);
		}
		if (options.always_pay) {
			const isEnabled = user.user.minion_defaultPay;
			await user.update({
				minion_defaultPay: !isEnabled
			});
			return `'Always pay farmers' is now ${!isEnabled ? 'enabled' : 'disabled'}.`;
		}
		if (options.default_compost) {
			const tier = CompostTiers.find(i => stringMatches(i.name, options.default_compost?.compost));
			if (!tier) return 'Invalid tier.';
			await user.update({
				minion_defaultCompostToUse: tier.name
			});
			return `You will now use ${tier.item.name} by default.`;
		}
		if (options.auto_farm_filter) {
			const autoFarmFilterString = Object.values(AutoFarmFilterEnum).find(
				i => i === options.auto_farm_filter?.auto_farm_filter_data
			);
			if (!autoFarmFilterString) return 'Invalid auto farm filter.';
			const autoFarmFilter = autoFarmFilterString as AutoFarmFilterEnum;

			await user.update({
				auto_farm_filter: autoFarmFilter
			});

			return `${autoFarmFilter} filter is now enabled when autofarming: ${autoFarmFilterTexts[autoFarmFilter]}.`;
		}
		if (options.set_preferred) {
			const preferenceMap = parsePreferredSeeds(
				(user.user as unknown as { minion_farmingPreferredSeeds?: Record<string, unknown> })
					.minion_farmingPreferredSeeds
			);
			let preferContractCurrent = Boolean(
				(user.user as unknown as { minion_farmingPreferContract?: boolean }).minion_farmingPreferContract
			);
			const responses: string[] = [];
			const patchNameInput = options.set_preferred.patch as FarmingPatchName | undefined;
			const seedInput = options.set_preferred.seed ?? undefined;
			const preferContractInput = options.set_preferred.prefer_contract;

			if (typeof preferContractInput === 'boolean') {
				if (preferContractInput !== preferContractCurrent) {
					await user.update({
						minion_farmingPreferContract: preferContractInput
					} as any);
					preferContractCurrent = preferContractInput;
				}
				responses.push(`Contract priority is now ${preferContractInput ? 'enabled' : 'disabled'}.`);
			}

			if (!patchNameInput && !seedInput) {
				const embed = buildPreferencesEmbed(patchesDetailed, preferenceMap, preferContractCurrent);
				if (responses.length > 0) {
					return { content: responses.join('\n'), embeds: [embed] };
				}
				return { embeds: [embed] };
			}

			if (!patchNameInput && seedInput) {
				return 'You must provide a patch when setting a seed preference.';
			}

			if (patchNameInput) {
				const patchData = patchesDetailed.find(patch => patch.patchName === patchNameInput);
				if (!patchData) {
					return 'Invalid patch.';
				}

				if (!seedInput) {
					const summary = `${patchData.friendlyName} → ${formatPreference(
						preferenceMap.get(patchData.patchName)
					)}`;
					if (responses.length > 0) {
						responses.push(summary);
						return responses.join('\n');
					}
					return summary;
				}

				const resolvedPreference = resolveSeedPreferenceInput(patchData.patchName, seedInput);
				if (typeof resolvedPreference === 'string') {
					return resolvedPreference;
				}

				preferenceMap.set(patchData.patchName, resolvedPreference);
				await user.update({
					minion_farmingPreferredSeeds: serializePreferredSeeds(preferenceMap)
				} as any);

				const summary = `${patchData.friendlyName} → ${formatPreference(resolvedPreference)}`;
				responses.push(summary);
				return responses.join('\n');
			}

			if (responses.length > 0) {
				return responses.join('\n');
			}
		}
		if (options.plant) {
			return farmingPlantCommand({
				user,
				interaction,
				plantName: options.plant.plant_name,
				quantity: options.plant.quantity ?? null,
				autoFarmed: false,
				pay: Boolean(options.plant.pay)
			});
		}
		if (options.harvest) {
			return harvestCommand({
				user: user,
				seedType: options.harvest.patch_name,
				interaction
			});
		}
		if (options.tithe_farm) {
			if (options.tithe_farm.buy_reward) {
				return titheFarmShopCommand(interaction, user, options.tithe_farm.buy_reward);
			}
			return titheFarmCommand(user, channelId);
		}
		if (options.compost_bin) {
			return compostBinCommand(interaction, user, options.compost_bin.plant_name, options.compost_bin.quantity);
		}
		if (options.contract) {
			return farmingContractCommand(user, options.contract.input);
		}

		return Farming.userGrowingProgressStr(patchesDetailed);
	}
});
