import { EmbedBuilder } from 'discord.js';
import { toKMB } from 'oldschooljs';

import { getItem } from '../../lib/util/getOSItem.js';
import { itemOption } from '../lib/mahojiCommandOptions.js';
import { sellPriceOfItem } from './sell.js';

export const priceCommand: OSBMahojiCommand = {
	name: 'price',
	description: 'Looks up the price of an item.',
	options: [
		{
			...itemOption(item => Boolean(item.tradeable_on_ge)),
			name: 'item',
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ item: string }>) => {
		const item = getItem(options.item);
		if (!item) return "Couldn't find that item.";

		const { basePrice: priceOfItem } = sellPriceOfItem(item);

		const embed = new EmbedBuilder()
			.setTitle(item.name)
			.setColor(52_224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(`${priceOfItem.toLocaleString()} (${toKMB(priceOfItem)})`);

		return { embeds: [embed] };
	}
};
