import { stringMatches } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Items } from 'oldschooljs';

import { zeroTimeFletchables } from '../../lib/skilling/skills/fletching/fletchables';
import type { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import type { ZeroTimeActivityType } from '../../lib/util/zeroTimeActivity';
import { getZeroTimeActivitySettings } from '../../lib/util/zeroTimeActivity';

const zeroTimeTypes: ZeroTimeActivityType[] = ['alch', 'fletch'];

function getAutomaticSelectionText(type: ZeroTimeActivityType) {
	return type === 'alch' ? 'automatic selection from your favourite alchs each trip' : 'automatic selection';
}

export const zeroTimeActivityCommand: OSBMahojiCommand = {
	name: 'zero_time_activity',
	description: 'Configure your preferred zero time activity.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'type',
			description: 'The zero time activity to use.',
			required: false,
			choices: zeroTimeTypes.map(type => ({ name: type, value: type }))
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'item',
			description: 'The item to use for the chosen zero time activity (if applicable).',
			required: false,
			autocomplete: async (value: string) => {
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
				if (trimmedValue.length > 0) {
					const duplicateValue = curatedOptions.some(option => option.value === trimmedValue);
					if (!duplicateValue) {
						results.push({
							name: `Use "${trimmedValue}"`,
							value: trimmedValue
						});
					}
				}

				for (const option of curatedOptions) {
					if (results.length >= 25) {
						break;
					}
					results.push(option);
				}

				return results;
			}
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'clear',
			description: 'Clear your zero time activity preference.',
			required: false
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ type?: string; item?: string; clear?: boolean }>) => {
		const user = await mUserFetch(userID);
		const currentSettings = getZeroTimeActivitySettings(user);

		if (options.clear) {
			await user.update({
				zero_time_activity_type: null,
				zero_time_activity_item: null
			});
			return 'Cleared your zero time activity preference.';
		}

		if (!options.type && !options.item) {
			if (!currentSettings) {
				return 'You currently have no zero time activity configured.';
			}
			const activityName = currentSettings.type === 'alch' ? 'Alching' : 'Fletching';
			const itemName = currentSettings.itemID
				? (Items.get(currentSettings.itemID)?.name ?? 'unknown item')
				: null;
			const itemDisplay = itemName ?? getAutomaticSelectionText(currentSettings.type);
			return `Your zero time activity is set to **${activityName}** using **${itemDisplay}**.`;
		}

		let type: ZeroTimeActivityType | null = null;
		if (options.type) {
			const typeInput = options.type.toLowerCase();
			if (!zeroTimeTypes.includes(typeInput as ZeroTimeActivityType)) {
				return `Invalid zero time activity type. Valid options: ${zeroTimeTypes.join(', ')}.`;
			}
			type = typeInput as ZeroTimeActivityType;
		} else if (options.item) {
			if (!currentSettings?.type) {
				return 'You must provide a type when setting a zero time activity.';
			}
			type = currentSettings.type;
		}

		if (!type) {
			return 'You must provide a type when setting a zero time activity.';
		}
		let itemID: number | null = null;
		let itemName: string | null = null;

		if (type === 'alch') {
			if (options.item) {
				const osItem = Items.get(options.item);
				if (!osItem) {
					return 'That is not a valid item to alch.';
				}
				if (!osItem.highalch || !osItem.tradeable) {
					return 'This item cannot be alched.';
				}
				if (user.skillLevel('magic') < 55) {
					return 'You need level 55 Magic to cast High Alchemy.';
				}
				itemID = osItem.id;
				itemName = osItem.name;
			}
		} else {
			let fletchable = options.item
				? zeroTimeFletchables.find(
						item => stringMatches(item.name, options.item ?? '') || item.id === Number(options.item)
					)
				: null;

			if (!fletchable && currentSettings?.type === 'fletch' && currentSettings.itemID) {
				fletchable = zeroTimeFletchables.find(item => item.id === currentSettings.itemID) ?? null;
			}

			if (!fletchable) {
				return 'You must specify a valid zero time fletching item.';
			}

			if (user.skillLevel('fletching') < fletchable.level) {
				return `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`;
			}

			if (fletchable.requiredSlayerUnlocks) {
				const { success } = hasSlayerUnlock(
					user.user.slayer_unlocks as SlayerTaskUnlocksEnum[],
					fletchable.requiredSlayerUnlocks
				);
				if (!success) {
					return `You don't have the required Slayer unlocks to fletch ${fletchable.name}.`;
				}
			}

			itemID = fletchable.id;
			itemName = fletchable.name;
		}

		await user.update({
			zero_time_activity_type: type,
			zero_time_activity_item: itemID
		});
		const activityName = type === 'alch' ? 'Alching' : 'Fletching';
		const resolvedItemName = itemID ? (itemName ?? Items.get(itemID)?.name ?? 'unknown item') : null;
		const itemDisplay = resolvedItemName ?? getAutomaticSelectionText(type);

		return `Your zero time activity has been set to **${activityName}** using **${itemDisplay}**.`;
	}
};
