import { stringMatches, Time } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Items } from 'oldschooljs';

import { zeroTimeFletchables } from '../../lib/skilling/skills/fletching/fletchables';
import type { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import {
	attemptZeroTimeActivity,
	getZeroTimeActivityPreferences,
	type AttemptZeroTimeActivityOptions,
	type ZeroTimeActivityPreference,
	type ZeroTimeActivityType
} from '../../lib/util/zeroTimeActivity';

const zeroTimeTypes: ZeroTimeActivityType[] = ['alch', 'fletch'];

function formatPreference(preference: ZeroTimeActivityPreference, user: MUser): string {
	const base = preference.type === 'alch' ? 'Alching' : 'Fletching';
	const itemName = preference.itemID ? Items.get(preference.itemID)?.name ?? 'unknown item' : 'automatic selection';
	return `${preference.role === 'primary' ? 'Primary' : 'Fallback'}: **${base}** using **${itemName}**`;
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
			name: fletchable.name,
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

function parseAlchItemInput(user: MUser, itemInput: string | null, context: 'primary' | 'fallback'): { itemID: number | null; error?: string } {
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
		const label = formatPreference(preference, user);

		const attemptOptions: AttemptZeroTimeActivityOptions =
			preference.type === 'alch'
				? {
					user,
					duration: Time.Minute,
					preference: preference as ZeroTimeActivityPreference & { type: 'alch' },
					quantityOverride: 1,
					variant: 'default'
				  }
				: {
					user,
					duration: Time.Minute,
					preference: preference as ZeroTimeActivityPreference & { type: 'fletch' },
					quantityOverride: 1
				  };

		const viability = attemptZeroTimeActivity(attemptOptions);
		if (viability.result) {
			lines.push(`${label} — Ready`);
		} else if (viability.message) {
			lines.push(`${label} — ${viability.message}`);
		} else {
			lines.push(`${label} — Not currently available.`);
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
					choices: [{ name: 'none', value: 'none' }, ...zeroTimeTypes.map(type => ({ name: type, value: type }))]
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
	run: async ({ options, userID }: CommandRunOptions<{
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
				const { itemID, error } = parseAlchItemInput(user, rawPrimaryItem ?? null, 'primary');
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

				if (fallbackInput === primaryType) {
					return 'Your fallback type must be different from your primary type.';
				}

				fallbackType = fallbackInput as ZeroTimeActivityType;

				if (fallbackType === 'alch') {
					const { itemID, error } = parseAlchItemInput(user, rawFallbackItem ?? null, 'fallback');
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

			await user.update({
				zero_time_activity_primary_type: primaryType,
				zero_time_activity_primary_item: primaryItemID,
				zero_time_activity_fallback_type: fallbackType,
				zero_time_activity_fallback_item: fallbackItemID
			});

			const refreshedUser = await mUserFetch(userID);
			const summary = getZeroTimeActivityPreferences(refreshedUser)
				.map(preference => formatPreference(preference, refreshedUser))
				.join('\n');

			return `Your zero-time preferences have been updated.\n${summary}`;
		}

		return 'Invalid zero-time activity command usage.';
	}
};
