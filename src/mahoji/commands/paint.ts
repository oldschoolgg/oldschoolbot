import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { canvasToBuffer, createCanvas } from '@/lib/canvas/canvasUtil';
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
					.map(i => ({ name: `${i.paintCanItem.name} (${bank.amount(i.itemId)}x Owned)`, value: i.itemId }));
			}
		},
		{
			...ownedItemOption(),
			required: true
		}
	],
	run: async ({ userID, options, interaction }: CommandRunOptions<{ paint?: string; item: string }>) => {
		const item = getItem(options.item);
		if (!item) {
			return "That's not a valid item.";
		}

		if (!options.paint) {
			const canvases = await Promise.all(paintColors.map(color => getPaintedItemImage(color, item.id)));
			const iconWidth = canvases[0].width;
			const iconHeight = canvases[0].height;
			const margin = 5;
			const textHeight = 16;
			const cols = 4;
			const rows = Math.ceil(canvases.length / cols);
			const canvas = createCanvas(cols * (iconWidth + margin * 2), rows * (iconHeight + textHeight + margin * 2));
			const ctx = canvas.getContext('2d');
			ctx.font = '12px Sans';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#fff';
			canvases.forEach((img, index) => {
				const col = index % cols;
				const row = Math.floor(index / cols);
				const x = col * (iconWidth + margin * 2) + margin;
				const y = row * (iconHeight + textHeight + margin * 2) + margin;
				ctx.drawImage(img, x, y, iconWidth, iconHeight);
				ctx.fillText(paintColors[index]!.name, x + iconWidth / 2, y + iconHeight + 12);
			});
			const buffer = await canvasToBuffer(canvas);
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
