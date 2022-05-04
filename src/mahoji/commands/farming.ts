import { time } from '@discordjs/builders';
import { User } from '@prisma/client';
import { Time } from 'e';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { Emoji } from '../../lib/constants';
import { defaultPatches } from '../../lib/minions/farming';
import { IPatchData, IPatchDataDetailed } from '../../lib/minions/farming/types';
import { autoFarm } from '../../lib/minions/functions/autoFarm';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Farming from '../../lib/skilling/skills/farming';
import { assert, formatDuration, stringMatches, toTitleCase } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { farmingPlantCommand } from '../lib/abstracted_commands/farmingCommand';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const farmingPatchNames = [
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

export type FarmingPatchName = typeof farmingPatchNames[number];

export function isPatchName(name: string): name is FarmingPatchName {
	return farmingPatchNames.includes(name as FarmingPatchName);
}

const farmingKeys: (keyof User)[] = farmingPatchNames.map(i => `farmingPatches_${i}` as const);

export function getFarmingKeyFromName(name: FarmingPatchName) {
	const key = farmingKeys.find(k => k.includes(name));
	if (!key) throw new Error('No farming key found');
	return key;
}

export function findPlant(lastPlanted: IPatchData['lastPlanted']) {
	if (!lastPlanted) return null;
	const plant = Farming.Plants.find(
		plants => stringMatches(plants.name, lastPlanted) || plants.aliases.some(a => stringMatches(a, lastPlanted))
	);
	if (!plant) throw new Error(`No plant found for ${lastPlanted}.`);
	return plant;
}

export function userGrowingProgressStr(patchesDetailed: IPatchDataDetailed[]) {
	let str = '';
	for (const patch of patchesDetailed.filter(i => i.ready === true)) {
		str += `${Emoji.Tick} **${patch.friendlyName}**: Your ${patch.lastPlanted} is ready to be harvested!\n`;
	}
	for (const patch of patchesDetailed.filter(i => i.ready === false)) {
		str += `${Emoji.Stopwatch} **${patch.friendlyName}**: Ready at ${time(patch.readyAt!, 'T')} (${time(
			patch.readyAt!,
			'R'
		)})\n`;
	}
	const notReady = patchesDetailed.filter(i => !i.ready);
	str += `${Emoji.RedX} **Not ready:** ${notReady.map(i => i.friendlyName).join(', ')}.`;
	return str;
}

export async function getFarmingInfo(userID: bigint | string) {
	let keys: Partial<Record<keyof User, true>> = {};
	for (const key of farmingKeys) keys[key] = true;
	const userData = await mahojiUsersSettingsFetch(userID, keys);

	const patches: Record<FarmingPatchName, IPatchData> = {} as Record<FarmingPatchName, IPatchData>;
	const patchesDetailed: IPatchDataDetailed[] = [];

	const now = Date.now();

	for (const key of farmingKeys) {
		const patch: IPatchData = (userData[key] as IPatchData | null) ?? defaultPatches;
		const patchName: FarmingPatchName = key.replace('farmingPatches_', '') as FarmingPatchName;
		assert(farmingPatchNames.includes(patchName));
		patches[patchName] = patch;

		const plant = findPlant(patch.lastPlanted);
		const difference = now - patch.plantTime;

		const ready = plant ? difference > plant.growthTime * Time.Minute : null;
		const readyAt = plant ? new Date(patch.plantTime + plant.growthTime * Time.Minute) : null;
		const readyIn = readyAt ? readyAt.getTime() - now : null;

		if (ready) {
			assert(readyAt !== null, 'readyAt shouldnt be null if ready');
			assert(
				readyIn !== null && readyIn <= 0,
				`${patchName} readyIn should be less than 0 ready, received ${readyIn} ${formatDuration(readyIn!)}`
			);
		}
		if (ready === false) {
			assert(readyAt !== null, `readyAt should have value if growing, received ${readyAt}`);
			assert(readyAt !== null, `${patchName} readyIn should have value if growing, received ${readyAt}`);
		}
		if (ready === null) {
			assert(readyAt === null, 'No readyAt if null');
			assert(readyIn === null, 'No readyIn if null');
		}

		patchesDetailed.push({
			...patch,
			ready,
			readyIn,
			patchName,
			readyAt,
			friendlyName: toTitleCase(patchName.replace('_', ' ')),
			plant
		});
	}

	return {
		patches,
		patchesDetailed
	};
}

export const CompostTiers = [
	{
		name: 'compost',
		item: getOSItem('Compost')
	},
	{
		name: 'supercompost',
		item: getOSItem('Supercompost')
	},
	{
		name: 'ultracompost',
		item: getOSItem('Ultracompost')
	}
] as const;

export type CompostName = typeof CompostTiers[number]['name'];

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
					autocomplete: async (value: string, user: APIUser) => {
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
		plant?: { plant_name: string; quantity?: number };
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const { patchesDetailed } = await getFarmingInfo(userID);

		if (options.auto_farm) {
			return autoFarm(interaction, klasaUser, patchesDetailed);
		}
		if (options.always_pay) {
			const isEnabled = klasaUser.settings.get(UserSettings.Minion.DefaultPay);
			await mahojiUserSettingsUpdate(client, userID, {
				minion_defaultPay: !isEnabled
			});
			return `'Always pay farmers' is now ${!isEnabled ? 'enabled' : 'disabled'}.`;
		}
		if (options.default_compost) {
			const tier = CompostTiers.find(i => stringMatches(i.name, options.default_compost!.compost));
			if (!tier) return 'Invalid tier.';
			await mahojiUserSettingsUpdate(client, userID, {
				minion_defaultCompostToUse: tier.name
			});
			return `You will now use ${tier.item.name} by default.`;
		}
		if (options.plant) {
			return farmingPlantCommand({
				user: klasaUser,
				plantName: options.plant.plant_name,
				quantity: options.plant.quantity ?? null,
				autoFarmed: false,
				channelID
			});
		}

		return userGrowingProgressStr(patchesDetailed);
	}
};
