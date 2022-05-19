import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Items, Util } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { sellPriceOfItem } from '../Minion/sell';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Looks up the price of an item.',
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		const item = Items.get(name);
		if (!item) return msg.channel.send("Couldn't find that item.");

		const priceOfItem = item.price;

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52_224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(
				`**Price:** ${Util.toKMB(priceOfItem)} 
**Sell price:** ${sellPriceOfItem(item).price}
**Alch value:** ${Util.toKMB(item.highalch)}`
			);

		return msg.channel.send({ embeds: [embed] });
	}
}
