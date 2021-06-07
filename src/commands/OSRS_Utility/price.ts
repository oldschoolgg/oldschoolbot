import { MessageEmbed } from 'discord.js';
import { calcPercentOfNum } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Items, Util } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { sellPriceOfItem } from '../Minion/sell';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			oneAtTime: true,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		const item = Items.get(name);
		if (!item) return msg.send(`Couldn't find that item.`);

		const priceOfItem = item.price;

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(
				`**Price:** ${Util.toKMB(priceOfItem)} 
**Sell price:** ${Util.toKMB(calcPercentOfNum(80, sellPriceOfItem(item)))}
**Alch value:** ${Util.toKMB(item.highalch)}`
			);

		return msg.send({ embed });
	}
}
