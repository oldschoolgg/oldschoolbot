import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Color } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['it', 'itemtrivia'],
			description: 'Sends a picture of a random item that you have to guess the name of.',
			cooldown: 1,
			oneAtTime: true,
			examples: ['+it'],
			categoryFlags: ['fun']
		});
	}

	async run(msg: KlasaMessage) {
		const randomItem = Items.filter(i => (i as Item).tradeable_on_ge).random() as Item;

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(`https://static.runelite.net/cache/item/icon/${randomItem.id}.png`)
			.setTitle(
				`${msg.author.username} has started a item trivia. Tell me what this item is called!`
			)
			.setDescription(randomItem.examine);

		await msg.channel.send(embed);

		try {
			const collected = await msg.channel.awaitMessages(
				_msg => stringMatches(_msg.content, randomItem.name),
				{
					max: 1,
					time: 14_000,
					errors: ['time']
				}
			);

			const winner = collected.first()!.author;
			return msg.channel.send(
				`<:RSTickBox:381462594734522372> ${winner.username} had the right answer with \`${randomItem.name}\`!`
			);
		} catch (err) {
			return msg.channel.send(`<:RSXBox:381462594961014794> Nobody answered correctly.`);
		}
	}
}
