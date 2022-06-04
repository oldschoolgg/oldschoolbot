import { Embed } from '@discordjs/builders';
import { CommandRunOptions } from 'mahoji';
import { toKMB } from 'oldschooljs/dist/util';

import { sellPriceOfItem } from '../../commands/Minion/sell';
import { getItem } from '../../lib/util/getOSItem';
import { itemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

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

		const priceOfItem = item.price;

		const embed = new Embed()
			.setTitle(item.name)
			.setColor(52_224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(
				`**Price:** ${toKMB(priceOfItem)} 
**Sell price:** ${sellPriceOfItem(item).price}
**Alch value:** ${toKMB(item.highalch)}`
			);

		return { embeds: [embed] };
	}
};
