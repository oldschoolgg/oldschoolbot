import { stringMatches, Time } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Items } from 'oldschooljs';

import { zeroTimeFletchables } from '../../lib/skilling/skills/fletching/fletchables';
import { SlayerRewardsShop, type SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import {
	attemptZeroTimeActivity,
	formatZeroTimePreference,
	getZeroTimeActivityPreferences,
	type ZeroTimeActivityType
} from '../../lib/util/zeroTimeActivity';

const zeroTimeTypes: ZeroTimeActivityType[] = ['alch', 'fletch'];

const slayerUnlockName = new Map<SlayerTaskUnlocksEnum, string>(
	SlayerRewardsShop.map(unlock => [unlock.id, unlock.name])
);

function describeFletchableRequirements(fletchable: (typeof zeroTimeFletchables)[number]): string {
	const parts: string[] = [`${fletchable.level} Fletching`];

	if (fletchable.requiredSlayerUnlocks?.length) {
		const unlockNames = fletchable.requiredSlayerUnlocks
			.map(unlock => slayerUnlockName.get(unlock))
			.filter((name): name is string => Boolean(name));
		if (unlockNames.length > 0) {
			parts.push(`${unlockNames.join(', ')} unlock`);
		}
	}

	return parts.join(' · ');
}

function getAutocompleteOptions(value: string) {
	const trimmedValue = value.trim();
	const search = trimmedValue.toLowerCase();
	const curatedOptions = zeroTimeFletchables
		.filter(fletchable =>
			search.length === 0
				? true
				: fletchable.name.toLowerCase().includes(search) || fletchable.id.toString() === search
		)
		.map(fletchable => ({
			name: `${fletchable.name} (${describeFletchableRequirements(fletchable)})`,
			value: fletchable.id.toString()
		}));

	const results: { name: string; value: string }[] = [];
	if (trimmedValue.length > 0 && !curatedOptions.some(option => option.value === trimmedValue)) {
		results.push({ name: `Use "${trimmedValue}"`, value: trimmedValue });
	}

	for (const option of curatedOptions) {
		if (results.length >= 25) {
			break;
		}
		results.push(option);
	}

	return results;
}

function parseAlchItemInput(
	user: MUser,
	itemInput: string | null
): {
	itemID: number | null;
	error?: string;
} {
	if (!itemInput || itemInput.length === 0) {
		return { itemID: null };
	}

	const osItem = Items.get(itemInput);
	if (!osItem) {
		return { itemID: null, error: 'That is not a valid item to alch.' };
	}
	if (!osItem.highalch || !osItem.tradeable) {
		return { itemID: null, error: 'This item cannot be alched.' };
	}
	if (user.skillLevel('magic') < 55) {
		return { itemID: null, error: 'You need level 55 Magic to cast High Alchemy.' };
	}

	return { itemID: osItem.id };
}

function parseFletchableInput(
	user: MUser,
	itemInput: string | null,
	contextLabel: string
): { itemID: number | null; error?: string } {
	if (!itemInput) {
		return { itemID: null, error: `${contextLabel} requires a fletching item.` };
	}

	const fletchable = zeroTimeFletchables.find(
		item => stringMatches(item.name, itemInput) || item.id === Number(itemInput)
	);

	if (!fletchable) {
		return { itemID: null, error: 'You must specify a valid zero-time fletching item.' };
	}

	if (user.skillLevel('fletching') < fletchable.level) {
		return {
			itemID: null,
			error: `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`
		};
	}

	if (fletchable.requiredSlayerUnlocks) {
		const { success } = hasSlayerUnlock(
			user.user.slayer_unlocks as SlayerTaskUnlocksEnum[],
			fletchable.requiredSlayerUnlocks
		);
		if (!success) {
			return {
				itemID: null,
				error: `You don't have the required Slayer unlocks to fletch ${fletchable.name}.`
			};
		}
	}

	return { itemID: fletchable.id };
}

function buildOverview(user: MUser): string {
	const preferences = getZeroTimeActivityPreferences(user);
	if (preferences.length === 0) {
		return 'You have no zero-time activity configured. Use `/zero_time_activity set` to create a primary (and optional fallback) preference.';
	}

	const lines: string[] = [];
	for (const preference of preferences) {
		const label = formatZeroTimePreference(preference);

		const outcome = attemptZeroTimeActivity({
			user,
			duration: Time.Minute,
			preferences: [preference],
			quantityOverride: 1,
			alch: { variant: 'default' },
			fletch: {}
		});

		if (outcome.result) {
			lines.push(`${label} -- Ready`);
			continue;
		}

		const failure = outcome.failures[0];
		if (failure?.message) {
			lines.push(`${label} -- ${failure.message}`);
		} else {
			lines.push(`${label} -- Not currently available.`);
		}
	}

	return lines.join('\n');
}

export const zeroTimeActivityCommand: OSBMahojiCommand = {
	name: 'zero_time_activity',
	description: 'Configure your preferred zero-time activities.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'overview',
			description: 'View your zero-time activity configuration.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set',
			description: 'Set your primary zero-time activity and optional fallback.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'primary_type',
					description: 'Your primary zero-time activity type.',
					required: true,
					choices: zeroTimeTypes.map(type => ({ name: type, value: type }))
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'primary_item',
					description: 'Optional item for the primary activity.',
					required: false,
					autocomplete: async (value: string) => getAutocompleteOptions(value)
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'fallback_type',
					description: 'Optional fallback zero-time activity type.',
					required: false,
					choices: [
						{ name: 'none', value: 'none' },
						...zeroTimeTypes.map(type => ({ name: type, value: type }))
					]
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'fallback_item',
					description: 'Optional item for the fallback activity.',
					required: false,
					autocomplete: async (value: string) => getAutocompleteOptions(value)
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'clear',
			description: 'Clear your zero-time activity preferences.'
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		overview?: Record<string, never>;
		set?: {
			primary_type: string;
			primary_item?: string | null;
			fallback_type?: string | null;
			fallback_item?: string | null;
		};
		clear?: Record<string, never>;
	}>) => {
		const user = await mUserFetch(userID);

		if (!options.overview && !options.set && !options.clear) {
			return buildOverview(user);
		}

		if (options.overview) {
			return buildOverview(user);
		}

		if (options.clear) {
			await user.update({
				zero_time_activity_primary_type: null,
				zero_time_activity_primary_item: null,
				zero_time_activity_fallback_type: null,
				zero_time_activity_fallback_item: null
			});
			return 'Cleared your zero-time activity preferences.';
		}

		if (options.set) {
			const {
				primary_type: rawPrimaryType,
				primary_item: rawPrimaryItem,
				fallback_type: rawFallbackType,
				fallback_item: rawFallbackItem
			} = options.set;

			const primaryTypeInput = rawPrimaryType.toLowerCase();
			if (!zeroTimeTypes.includes(primaryTypeInput as ZeroTimeActivityType)) {
				return `Invalid primary type. Valid options: ${zeroTimeTypes.join(', ')}.`;
			}
			const primaryType = primaryTypeInput as ZeroTimeActivityType;

			let primaryItemID: number | null = null;
			if (primaryType === 'alch') {
				const { itemID, error } = parseAlchItemInput(user, rawPrimaryItem ?? null);
				if (error) {
					return error;
				}
				primaryItemID = itemID;
			} else {
				const { itemID, error } = parseFletchableInput(user, rawPrimaryItem ?? null, 'Primary fletching');
				if (error) {
					return error;
				}
				primaryItemID = itemID;
			}

			let fallbackType: ZeroTimeActivityType | null = null;
			let fallbackItemID: number | null = null;

			if (rawFallbackType && rawFallbackType.toLowerCase() !== 'none') {
				const fallbackInput = rawFallbackType.toLowerCase();
				if (!zeroTimeTypes.includes(fallbackInput as ZeroTimeActivityType)) {
					return `Invalid fallback type. Valid options: ${zeroTimeTypes.join(', ')} or 'none'.`;
				}

				fallbackType = fallbackInput as ZeroTimeActivityType;

				if (fallbackType === 'alch') {
					const { itemID, error } = parseAlchItemInput(user, rawFallbackItem ?? null);
					if (error) {
						return error;
					}
					fallbackItemID = itemID;
				} else {
					const { itemID, error } = parseFletchableInput(user, rawFallbackItem ?? null, 'Fallback fletching');
					if (error) {
						return error;
					}
					fallbackItemID = itemID;
				}
			}

			if (fallbackType && fallbackType === primaryType && fallbackItemID === primaryItemID) {
				return 'Your fallback preference must be different from your primary preference.';
			}

			await user.update({
				zero_time_activity_primary_type: primaryType,
				zero_time_activity_primary_item: primaryItemID,
				zero_time_activity_fallback_type: fallbackType,
				zero_time_activity_fallback_item: fallbackItemID
			});

			const refreshedUser = await mUserFetch(userID);
			const summaryLines = getZeroTimeActivityPreferences(refreshedUser).map(formatZeroTimePreference);

			return `Saved your zero-time preferences.\n${summaryLines.join('\n')}`;
		}

		return 'Invalid zero-time activity command usage.';
	}
};
