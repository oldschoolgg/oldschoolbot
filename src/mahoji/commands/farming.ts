import { User } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import TitheFarmBuyables from '../../lib/data/buyables/titheFarmBuyables';
import { superCompostables } from '../../lib/data/filterables';
import { ContractOption, ContractOptions } from '../../lib/minions/farming/types';
import { autoFarm } from '../../lib/minions/functions/autoFarm';
import { getFarmingInfo } from '../../lib/skilling/functions/getFarmingInfo';
import Farming, { CompostName, CompostTiers } from '../../lib/skilling/skills/farming';
import { getSkillsOfMahojiUser, stringMatches } from '../../lib/util';
import { farmingPatchNames, userGrowingProgressStr } from '../../lib/util/farmingHelpers';
import { deferInteraction } from '../../lib/util/interactionReply';
import { compostBinCommand, farmingPlantCommand, harvestCommand } from '../lib/abstracted_commands/farmingCommand';
import { farmingContractCommand } from '../lib/abstracted_commands/farmingContractCommand';
import { titheFarmCommand, titheFarmShopCommand } from '../lib/abstracted_commands/titheFarmCommand';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const farmingCommand: OSBMahojiCommand = {
	name: 'farming',
	description: 'Allows you to do Farming related things.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check_patches',
			description: 'The page in your bank you want to see.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'plant',
			description: 'Allows you to plant seeds and train Farming.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'plant_name',
					description: 'The plant you want to plant.',
					required: true,
					autocomplete: async (value: string, user: User) => {
						const mUser = await mahojiUsersSettingsFetch(user.id);
						const farmingLevel = getSkillsOfMahojiUser(mUser, true).farming;
						return Farming.Plants.filter(i => farmingLevel >= i.level)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to plant.',
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'pay',
					description: 'Pay farmers for protection.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'auto_farm',
			description: 'Automatically farm any available things you can do.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'default_compost',
			description: 'Set which compost you want to use by default.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'compost',
					description: 'The compost you want to use by default.',
					required: true,
					choices: CompostTiers.map(i => ({ name: i.item.name, value: i.item.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'always_pay',
			description: 'Toggle always paying farmers for protection.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'harvest',
			description: 'Allows you to harvest patches without replanting.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'patch_name',
					description: 'The patches you want to harvest.',
					required: true,
					choices: farmingPatchNames.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'tithe_farm',
			description: 'Allows you to do the Tithe Farm minigame.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
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
			type: ApplicationCommandOptionType.Subcommand,
			name: 'compost_bin',
			description: 'Allows you to make compost from crops.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'plant_name',
					description: 'The plant you want to put in the Compost Bins.',
					required: false,
					autocomplete: async (value: string) => {
						return superCompostables
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to put in.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'contract',
			description: 'Allows you to do Farming Contracts.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'input',
					description: 'The input you want to give.',
					required: false,
					choices: ContractOptions.map(i => ({ value: i, name: i }))
				}
			]
		}
	],
	run: async ({
		userID,
		options,
		interaction,
		channelID
	}: CommandRunOptions<{
		check_patches?: {};
		auto_farm?: {};
		default_compost?: { compost: CompostName };
		always_pay?: {};
		plant?: { plant_name: string; quantity?: number; pay?: boolean };
		harvest?: { patch_name: string };
		tithe_farm?: { buy_reward?: string };
		compost_bin?: { plant_name: string; quantity?: number };
		contract?: { input?: ContractOption };
	}>) => {
		await deferInteraction(interaction);
		const klasaUser = await mUserFetch(userID);
		const { patchesDetailed } = await getFarmingInfo(userID);

		if (options.auto_farm) {
			return autoFarm(klasaUser, patchesDetailed, channelID);
		}
		if (options.always_pay) {
			const isEnabled = klasaUser.user.minion_defaultPay;
			await klasaUser.update({
				minion_defaultPay: !isEnabled
			});
			return `'Always pay farmers' is now ${!isEnabled ? 'enabled' : 'disabled'}.`;
		}
		if (options.default_compost) {
			const tier = CompostTiers.find(i => stringMatches(i.name, options.default_compost!.compost));
			if (!tier) return 'Invalid tier.';
			await klasaUser.update({
				minion_defaultCompostToUse: tier.name
			});
			return `You will now use ${tier.item.name} by default.`;
		}
		if (options.plant) {
			return farmingPlantCommand({
				userID: klasaUser.id,
				plantName: options.plant.plant_name,
				quantity: options.plant.quantity ?? null,
				autoFarmed: false,
				channelID,
				pay: Boolean(options.plant.pay)
			});
		}
		if (options.harvest) {
			return harvestCommand({
				user: klasaUser,
				seedType: options.harvest.patch_name,
				channelID
			});
		}
		if (options.tithe_farm) {
			if (options.tithe_farm.buy_reward) {
				return titheFarmShopCommand(interaction, klasaUser, options.tithe_farm.buy_reward);
			}
			return titheFarmCommand(klasaUser, channelID);
		}
		if (options.compost_bin) {
			return compostBinCommand(
				interaction,
				klasaUser,
				options.compost_bin.plant_name,
				options.compost_bin.quantity
			);
		}
		if (options.contract) {
			return farmingContractCommand(userID, options.contract.input);
		}

		return userGrowingProgressStr(patchesDetailed);
	}
};
