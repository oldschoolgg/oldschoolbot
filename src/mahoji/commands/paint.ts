import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { getPaintedItemImage, paintColors } from '../../lib/paintColors';
import { canvasToBuffer } from '../../lib/util/canvasUtil';
import { itemEffectImageCache } from '../../lib/util/customItemEffects';
import { getItem } from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

export const paintCommand: OSBMahojiCommand = {
	name: 'paint',
	description: 'Paint an item.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'paint',
			description: 'The paint you want to use.',
			required: true,
			autocomplete: async (value, user) => {
				const { bank } = await mUserFetch(user.id);
				return paintColors
					.filter(i => {
						if (!value) return true;
						return i.paintCanItem.name.toLowerCase().includes(value.toLowerCase());
					})
					.map(i => ({ name: `${i.paintCanItem.name} (${bank.amount(i.itemId)}x Owned)`, value: i.itemId }));
			}
		},
		{
			...ownedItemOption(),
			required: true
		}
	],
	run: async ({ userID, options, interaction }: CommandRunOptions<{ paint: string; item: string }>) => {
		const paint = paintColors.find(i => i.itemId.toString() === options.paint);
		if (!paint) {
			return "That's not a valid paint.";
		}
		const item = getItem(options.item);
		if (!item) {
			return "That's not a valid item.";
		}

		const user = await mUserFetch(userID);
		const image = await canvasToBuffer(await getPaintedItemImage(paint, item.id));

		if (!user.bank.has(paint.itemId)) {
			return {
				content: "You don't own that paint can, but here's what it would look like if you did.",
				files: [image]
			};
		}

		await handleMahojiConfirmation(interaction, {
			files: [image],
			content:
				'Are you sure you want to paint this item? This will consume the paint can, and it will apply to all items of this type in your bank. The paint does not transfer if the items are traded, and stays with your account only.'
		});

		const cost = new Bank().add(paint.itemId);
		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}
		await user.removeItemsFromBank(cost);
		await user.update({
			painted_items_tuple: Array.from(user.paintedItems.entries())
				.filter(i => i[0] !== item.id)
				.concat([[item.id, paint.itemId]])
		});
		itemEffectImageCache.delete(`${user.id}-${item.id}`);
		return `You painted your ${item.name} with ${paint.paintCanItem.name}!`;
	}
};
