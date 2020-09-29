import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		const item = getOSItem(name);
		if (!item) return msg.send(`Couldn't find that item.`);

		const priceOfItem = await this.client.fetchItemPrice(item.id);

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setDescription(`${priceOfItem.toLocaleString()} (${Util.toKMB(priceOfItem)})`);
		let toReturn = {};
		if (item.custom && item.icon) {
			embed.setThumbnail(`attachment://icon.png`);
			toReturn = {
				embed,
				files: [
					{
						attachment: `./icon_cache/${item.id}.png`,
						name: 'icon.png'
					}
				]
			};
		} else {
			embed.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			);
			toReturn = { embed };
		}
		return msg.send(toReturn);
	}
}
