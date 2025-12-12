import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';

import { Fletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import Fletching from '@/lib/skilling/skills/fletching/index.js';
import type { FletchingActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
export const fletchCommand = defineCommand({
	name: 'fletch',
	description: 'Fletch items with the Fletching skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/craft name:Onyx necklace']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The item you want to Fletch.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return Fletchables.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to fletch (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, user, channelId }) => {
		const fletchable = Fletching.Fletchables.find(item => stringMatches(item.name, options.name));

		if (!fletchable) return 'That is not a valid fletchable item.';
		let sets = 'x';
		if (fletchable.outputMultiple) {
			sets = ' sets of';
		}

		if (user.skillLevel('fletching') < fletchable.level) {
			return `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`;
		}

		if (fletchable.requiredSlayerUnlocks) {
			const { success, errors } = user.checkHasSlayerUnlocks(fletchable.requiredSlayerUnlocks);
			if (!success) {
				return `You don't have the required Slayer Unlocks to create this item.\n\nRequired: ${errors}`;
			}
		}

		const userBank = user.bank;

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchable.tickRate < 1) {
			timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6;
		}

		const maxTripLength = await user.calcMaxTripLength('Fletching');
		let { quantity } = options;

		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToFletchSingleItem);
			const max = userBank.fits(fletchable.inputItems);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToFletchSingleItem;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${fletchable.name}s you can fletch is ${Math.floor(
				maxTripLength / timeToFletchSingleItem
			)}.`;
		}

		const itemsNeeded = fletchable.inputItems.clone().multiply(quantity);
		if (!userBank.has(itemsNeeded)) {
			return `You don't have enough items. For ${quantity}x ${fletchable.name}, you're missing **${itemsNeeded
				.clone()
				.remove(userBank)}**.`;
		}

		await user.transactItems({ itemsToRemove: itemsNeeded });

		await ActivityManager.startTrip<FletchingActivityTaskOptions>({
			fletchableName: fletchable.name,
			userID: user.id,
			channelId,
			quantity,
			duration,
			type: 'Fletching'
		});

		return `${user.minionName} is now Fletching ${quantity}${sets} ${
			fletchable.name
		}, it'll take around ${await formatTripDuration(user, duration)} to finish. Removed ${itemsNeeded} from your bank.`;
	}
});
