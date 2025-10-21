import { stringMatches } from '@oldschoolgg/toolkit';

import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import TitheFarmBuyables from '@/lib/data/buyables/titheFarmBuyables.js';
import { superCompostables } from '@/lib/data/filterables.js';
import { choicesOf } from '@/lib/discord/index.js';
import { autoFarm } from '@/lib/minions/functions/autoFarm.js';
import { CompostTiers, Farming } from '@/lib/skilling/skills/farming/index.js';
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
					autocomplete: async (value: string, user: MUser) => {
						return Farming.Plants.filter(i => user.skillsAsLevels.farming >= i.level)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity you want to plant.',
					required: false
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
					autocomplete: async (value: string) => {
						return TitheFarmBuyables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
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
					autocomplete: async (value: string) => {
						return superCompostables
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					}
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
	run: async ({ user, options, interaction, channelID }) => {
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
			return titheFarmCommand(user, channelID);
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
