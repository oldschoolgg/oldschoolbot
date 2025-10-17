import { EmbedBuilder } from 'discord.js';
import { Items, toKMB } from 'oldschooljs';

import { itemOption } from '@/lib/discord/index.js';
import { sellPriceOfItem } from '@/mahoji/commands/sell.js';

export const priceCommand = defineCommand({
	name: 'price',
	description: 'Looks up the price of an item.',
	options: [
		{
			...itemOption(item => Boolean(item.tradeable_on_ge)),
			name: 'item',
			required: true
		}
	],
	run: async ({ options }) => {
		const item = Items.getItem(options.item);
		if (!item || item.customItemData?.isSecret) return "Couldn't find that item.";

		const { basePrice: priceOfItem } = sellPriceOfItem(item);

		const embed = new EmbedBuilder()
			.setTitle(item.name)
			.setColor(52_224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(
				`**Price:** ${toKMB(priceOfItem)}
**Sell price:** ${sellPriceOfItem(item).price}
**Alch value:** ${toKMB(item.highalch ?? 0)}`
			);

		return { embeds: [embed.data] };
	}
});
