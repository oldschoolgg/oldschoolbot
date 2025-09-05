import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { canvasToBuffer } from '@/lib/canvas/canvasUtil';
import { renderPaintGrid } from '@/lib/canvas/renderPaintGrid';
import { paintColors } from '../../lib/customItems/paintCans';
import { getPaintedItemImage } from '../../lib/paintColors';
import { itemEffectImageCache } from '../../lib/util/customItemEffects';
import { getItem } from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { ownedItemOption } from '../lib/mahojiCommandOptions';

export const paintCommand: OSBMahojiCommand = {
	name: 'paint',
	description: 'Paint an item.',
	options: [
		{
			...ownedItemOption(),
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'paint',
			description: 'The paint you want to use. Leave blank to preview all paints.',
			required: false,
			autocomplete: async (value, user) => {
				const { bank } = await mUserFetch(user.id);
				return paintColors
					.filter(i => {
						if (!value) return true;
						return i.paintCanItem.name.toLowerCase().includes(value.toLowerCase());
					})
					.map(i => ({
						name: `${i.paintCanItem.name} (${bank.amount(i.itemId)}x Owned)`,
						value: i.itemId.toString()
					}));
			}
		}
	],
	run: async ({ userID, options, interaction }: CommandRunOptions<{ paint?: string; item: string }>) => {
		const item = getItem(options.item);
		if (!item) {
			return "That's not a valid item.";
		}

		if (!options.paint) {
			const canvases = await Promise.all(paintColors.map(color => getPaintedItemImage(color, item.id)));

			const tiles = paintColors
				.map((color, i) => ({ name: color.paintCanItem.name, img: canvases[i] }))
				.filter(t => t.img);

			if (!tiles || tiles.length === 0) {
				return 'No paint previews available for this item.';
			}

			const buffer = await renderPaintGrid(tiles, {
				gap: 14,
				padding: 20,
				extraTextWidth: 60,
				maxCols: 6,
				baseFontSize: 14,
				minFontSize: 10
			});

			return {
				content: `Paint previews for ${item.name}:`,
				files: [{ attachment: buffer, name: 'paint-previews.png' }]
			};
		}

		const paint = paintColors.find(i => i.itemId.toString() === options.paint);
		if (!paint) {
			return "That's not a valid paint.";
		}

		const user = await mUserFetch(userID);
		const imageBuffer = await canvasToBuffer(await getPaintedItemImage(paint, item.id));

		const cost = new Bank().add(paint.itemId);
		if (!user.owns(cost)) {
			return {
				content: "You don't own that paint can, but here's what it would look like if you did.",
				files: [{ attachment: imageBuffer, name: 'paint-preview.png' }]
			};
		}

		await handleMahojiConfirmation(interaction, {
			files: [{ attachment: imageBuffer, name: 'paint-preview.png' }],
			content:
				'Are you sure you want to paint this item? This will consume the paint can, and it will apply to all items of this type in your bank. The paint does not transfer if the items are traded, and stays with your account only.'
		});

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

		return {
			content: `You painted your ${item.name} with ${paint.paintCanItem.name}!`,
			files: [{ attachment: imageBuffer, name: 'painted-item.png' }]
		};
	}
};
