import { stringMatches, Time } from '@oldschoolgg/toolkit';
import type { CommandInteractionOption, GuildMember } from 'discord.js';
import { Items } from 'oldschooljs';

import type { AutocompleteContext } from '../../lib/discord/commandOptions.js';
import { zeroTimeFletchables } from '../../lib/skilling/skills/fletching/fletchables/index.js';
import { SlayerRewardsShop, type SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks.js';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil.js';
import {
	attemptZeroTimeActivity,
	formatZeroTimePreference,
	getZeroTimeActivityPreferences,
	type ZeroTimeActivityType
} from '../../lib/util/zeroTimeActivity.js';

const zeroTimeTypes: ZeroTimeActivityType[] = ['alch', 'fletch'];

interface AlchableAutocompleteItem {
	id: number;
	name: string;
	nameLower: string;
	highAlchValue: number;
}

export const favouriteAlchsAutocompleteValue = 'favourite_alchs';

const alchableAutocompleteItems: AlchableAutocompleteItem[] = Items.filter(
	item => Boolean(item.highalch) && Boolean(item.tradeable)
).map(item => ({
	id: item.id,
	name: item.name,
	nameLower: item.name.toLowerCase(),
	highAlchValue: item.highalch ?? 0
}));

alchableAutocompleteItems.sort((a, b) => a.name.localeCompare(b.name));

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

	return parts.join(' -> ');
}

function getFletchAutocompleteOptions(value: string) {
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

function getAlchAutocompleteOptions(value: string) {
	const trimmedValue = value.trim();
	const search = trimmedValue.toLowerCase();
	const curatedOptions: AlchableAutocompleteItem[] = [];

	const results: { name: string; value: string }[] = [
		{ name: 'Favourite Alchs', value: favouriteAlchsAutocompleteValue }
	];

	for (const item of alchableAutocompleteItems) {
		if (search.length === 0 || item.nameLower.includes(search) || item.id.toString() === search) {
			curatedOptions.push(item);
		}

		if (curatedOptions.length >= 25) {
			break;
		}
	}

	if (
		trimmedValue.length > 0 &&
		trimmedValue !== favouriteAlchsAutocompleteValue &&
		!curatedOptions.some(option => option.id.toString() === trimmedValue)
	) {
		results.push({ name: `Use "${trimmedValue}"`, value: trimmedValue });
	}

	for (const option of curatedOptions) {
		if (results.length >= 25) {
			break;
		}
		const formattedAlchValue = option.highAlchValue.toLocaleString();
		results.push({
			name: `${option.name} (High alch: ${formattedAlchValue} gp)`,
			value: option.id.toString()
		});
	}

	return results;
}

function getStringOptionValue(option: CommandInteractionOption | undefined): string | null {
	if (!option) {
		return null;
	}
	const rawValue = (option as CommandInteractionOption & { value?: unknown }).value;
	return typeof rawValue === 'string' ? rawValue : null;
}

function getSelectedActivityTypeFromContext(context: AutocompleteContext | undefined): ZeroTimeActivityType | null {
	if (!context) {
		return null;
	}
	const focusedName = context.focusedOption.name;
	let typeOptionName: 'primary_type' | 'fallback_type' | null = null;

	if (focusedName === 'primary_item') {
		typeOptionName = 'primary_type';
	} else if (focusedName === 'fallback_item') {
		typeOptionName = 'fallback_type';
	}

	if (!typeOptionName) {
		return null;
	}

	const typeOption = context.options.find(option => option.name === typeOptionName);
	const rawType = getStringOptionValue(typeOption);
	if (!rawType) {
		return null;
	}

	const normalised = rawType.toLowerCase();
	if (!zeroTimeTypes.includes(normalised as ZeroTimeActivityType)) {
		return null;
	}

	return normalised as ZeroTimeActivityType;
}

function fallbackTypeIsNone(context: AutocompleteContext | undefined): boolean {
	if (!context || context.focusedOption.name !== 'fallback_item') {
		return false;
	}

	const fallbackTypeOption = context.options.find(option => option.name === 'fallback_type');
	const rawValue = getStringOptionValue(fallbackTypeOption);
	return rawValue !== null && rawValue.toLowerCase() === 'none';
}

function getStoredTypeFromUser(
	user: MUser,
	focusedOptionName: AutocompleteContext['focusedOption']['name'] | undefined
): ZeroTimeActivityType | null {
	if (!focusedOptionName) {
		return null;
	}

	if (focusedOptionName === 'primary_item') {
		return user.user.zero_time_activity_primary_type ?? null;
	}

	if (focusedOptionName === 'fallback_item') {
		return user.user.zero_time_activity_fallback_type ?? null;
	}

	return null;
}

function getAutocompleteOptions(value: string, user: MUser, context?: AutocompleteContext) {
	if (fallbackTypeIsNone(context)) {
		return [];
	}

	const selectedType = getSelectedActivityTypeFromContext(context);
	const storedType = selectedType ?? getStoredTypeFromUser(user, context?.focusedOption.name);

	if (storedType === 'alch') {
		return getAlchAutocompleteOptions(value);
	}

	return getFletchAutocompleteOptions(value);
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

	const trimmedInput = itemInput.trim();
	if (trimmedInput === favouriteAlchsAutocompleteValue) {
		return { itemID: null };
	}
	if (trimmedInput.length === 0) {
		return { itemID: null };
	}
	const numericID = Number(trimmedInput);
	const lookupValue = Number.isInteger(numericID) && numericID.toString() === trimmedInput ? numericID : trimmedInput;

	const osItem = Items.getItem(lookupValue);
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
			type: 'Subcommand',
			name: 'overview',
			description: 'View your zero-time activity configuration.'
		},
		{
			type: 'Subcommand',
			name: 'set',
			description: 'Set your primary zero-time activity and optional fallback.',
			options: [
				{
					type: 'String',
					name: 'primary_type',
					description: 'Your primary zero-time activity type.',
					required: false,
					choices: zeroTimeTypes.map(type => ({ name: type, value: type }))
				},
				{
					type: 'String',
					name: 'primary_item',
					description: 'Optional item for the primary activity.',
					required: false,
					autocomplete: async (
						value: string,
						user: MUser,
						_member: GuildMember | undefined,
						context?: AutocompleteContext
					) => getAutocompleteOptions(value, user, context)
				},
				{
					type: 'String',
					name: 'fallback_type',
					description: 'Optional fallback zero-time activity type.',
					required: false,
					choices: [
						{ name: 'none', value: 'none' },
						...zeroTimeTypes.map(type => ({ name: type, value: type }))
					]
				},
				{
					type: 'String',
					name: 'fallback_item',
					description: 'Optional item for the fallback activity.',
					required: false,
					autocomplete: async (
						value: string,
						user: MUser,
						_member: GuildMember | undefined,
						context?: AutocompleteContext
					) => getAutocompleteOptions(value, user, context)
				}
			]
		},
		{
			type: 'Subcommand',
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
			primary_type: string | null;
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

			const existingPrimaryType = user.user.zero_time_activity_primary_type;
			const existingPrimaryItem = user.user.zero_time_activity_primary_item;
			const existingFallbackType = user.user.zero_time_activity_fallback_type as ZeroTimeActivityType | null;
			const existingFallbackItem = user.user.zero_time_activity_fallback_item;
			const primaryTypeWasProvided = typeof rawPrimaryType === 'string';
			const primaryItemWasProvided = rawPrimaryItem !== undefined;
			const fallbackTypeWasProvided = typeof rawFallbackType === 'string';
			const fallbackItemWasProvided = rawFallbackItem !== undefined;
			let primaryTypeToUse: ZeroTimeActivityType | null = null;
			if (primaryTypeWasProvided && rawPrimaryType) {
				const normalised = rawPrimaryType.toLowerCase();
				if (!zeroTimeTypes.includes(normalised as ZeroTimeActivityType)) {
					return `Invalid primary type. Valid options: ${zeroTimeTypes.join(', ')}.`;
				}
				primaryTypeToUse = normalised as ZeroTimeActivityType;
			} else if (existingPrimaryType) {
				primaryTypeToUse = existingPrimaryType;
			}

			const shouldUpdatePrimary = primaryTypeWasProvided || primaryItemWasProvided;
			let primaryItemIDToSave: number | null | undefined;
			let primaryTypeForComparison: ZeroTimeActivityType | null = existingPrimaryType ?? null;
			let primaryItemForComparison: number | null = existingPrimaryItem ?? null;

			const updateData: {
				zero_time_activity_primary_type?: ZeroTimeActivityType | null;
				zero_time_activity_primary_item?: number | null;
				zero_time_activity_fallback_type?: ZeroTimeActivityType | null;
				zero_time_activity_fallback_item?: number | null;
			} = {};

			if (shouldUpdatePrimary) {
				if (!primaryTypeToUse) {
					return 'Set a primary type before configuring the primary preference.';
				}

				if (primaryItemWasProvided) {
					if (primaryTypeToUse === 'alch') {
						const { itemID, error } = parseAlchItemInput(user, rawPrimaryItem ?? null);
						if (error) {
							return error;
						}
						primaryItemIDToSave = itemID;
					} else {
						const { itemID, error } = parseFletchableInput(
							user,
							rawPrimaryItem ?? null,
							'Primary fletching'
						);
						if (error) {
							return error;
						}
						primaryItemIDToSave = itemID;
					}
				} else if (primaryTypeWasProvided && primaryTypeToUse !== existingPrimaryType) {
					if (primaryTypeToUse === 'fletch') {
						const { error } = parseFletchableInput(user, null, 'Primary fletching');
						return error ?? 'Primary fletching requires a fletching item.';
					}
					primaryItemIDToSave = null;
				}

				if (primaryTypeWasProvided) {
					updateData.zero_time_activity_primary_type = primaryTypeToUse;
					primaryTypeForComparison = primaryTypeToUse;
				}

				if (primaryItemWasProvided || primaryItemIDToSave !== undefined) {
					updateData.zero_time_activity_primary_item = primaryItemIDToSave ?? null;
					primaryItemForComparison = primaryItemIDToSave ?? null;
				}
			}

			const existingFallbackItemForComparison = existingFallbackItem ?? null;
			let fallbackTypeForComparison: ZeroTimeActivityType | null = existingFallbackType ?? null;
			let fallbackItemForComparison: number | null = existingFallbackItemForComparison;
			let fallbackTypeToSave: ZeroTimeActivityType | null | undefined;
			let fallbackItemIDToSave: number | null | undefined;

			if (fallbackTypeWasProvided) {
				const fallbackInput = rawFallbackType!.toLowerCase();
				if (fallbackInput === 'none') {
					fallbackTypeToSave = null;
					fallbackItemIDToSave = null;
					fallbackTypeForComparison = null;
					fallbackItemForComparison = null;
				} else {
					if (!zeroTimeTypes.includes(fallbackInput as ZeroTimeActivityType)) {
						return `Invalid fallback type. Valid options: ${zeroTimeTypes.join(', ')} or 'none'.`;
					}

					const fallbackType = fallbackInput as ZeroTimeActivityType;
					if (fallbackType === 'alch') {
						const { itemID, error } = parseAlchItemInput(user, rawFallbackItem ?? null);
						if (error) {
							return error;
						}
						fallbackItemIDToSave = itemID;
					} else {
						const { itemID, error } = parseFletchableInput(
							user,
							rawFallbackItem ?? null,
							'Fallback fletching'
						);
						if (error) {
							return error;
						}
						fallbackItemIDToSave = itemID;
					}

					fallbackTypeToSave = fallbackType;
					fallbackTypeForComparison = fallbackType;
					fallbackItemForComparison = fallbackItemIDToSave ?? null;
				}
			}

			if (!fallbackTypeWasProvided && fallbackItemWasProvided) {
				const fallbackTypeToUse = fallbackTypeForComparison;
				if (!fallbackTypeToUse) {
					return 'Set a fallback type before configuring the fallback preference.';
				}

				if (fallbackTypeToUse === 'alch') {
					const { itemID, error } = parseAlchItemInput(user, rawFallbackItem ?? null);
					if (error) {
						return error;
					}
					fallbackItemIDToSave = itemID;
				} else {
					const { itemID, error } = parseFletchableInput(user, rawFallbackItem ?? null, 'Fallback fletching');
					if (error) {
						return error;
					}
					fallbackItemIDToSave = itemID;
				}

				fallbackItemForComparison = fallbackItemIDToSave ?? null;
			}

			const fallbackTypeForDuplicateCheck =
				fallbackTypeToSave !== undefined ? fallbackTypeToSave : fallbackTypeForComparison;
			const fallbackItemForDuplicateCheck =
				fallbackItemIDToSave !== undefined ? (fallbackItemIDToSave ?? null) : fallbackItemForComparison;

			if (
				fallbackTypeForDuplicateCheck &&
				fallbackTypeForDuplicateCheck === primaryTypeForComparison &&
				fallbackItemForDuplicateCheck === primaryItemForComparison
			) {
				return 'Your fallback preference must be different from your primary preference.';
			}

			if (fallbackTypeToSave !== undefined) {
				updateData.zero_time_activity_fallback_type = fallbackTypeToSave;
			}

			if (fallbackItemIDToSave !== undefined) {
				updateData.zero_time_activity_fallback_item = fallbackItemIDToSave ?? null;
			}

			if (Object.keys(updateData).length === 0) {
				return 'You did not specify any changes to your zero-time activity preferences.';
			}

			await user.update(updateData);

			const refreshedUser = await mUserFetch(userID);
			const summaryLines = getZeroTimeActivityPreferences(refreshedUser).map(formatZeroTimePreference);

			return `Saved your zero-time preferences.\n${summaryLines.join('\n')}`;
		}

		return 'Invalid zero-time activity command usage.';
	}
};
