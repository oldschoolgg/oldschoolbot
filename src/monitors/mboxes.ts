import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Monitor, MonitorStore } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Color, SupportServer, Time } from '../lib/constants';
import { getRandomMysteryBox } from '../lib/openables';
import { itemID, roll, stringMatches } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';

export default class extends Monitor {
	public lastDrop = 0;

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreBots: true,
			ignoreEdits: true,
			ignoreSelf: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) {
			return;
		}

		if (msg.channel.id !== '732207379818479756') {
			return;
		}

		if (Date.now() - this.lastDrop < Time.Minute * 18.5) return;
		if (!roll(20)) return;
		this.lastDrop = Date.now();

		const randomItem = Items.filter(i => (i as Item).tradeable_on_ge).random() as Item;

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(`https://static.runelite.net/cache/item/icon/${randomItem.id}.png`)
			.setTitle('Tell me what this item is called, for a Mystery Box!')
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

			const winner = collected.first()?.author!;
			const box = roll(10) ? getRandomMysteryBox() : itemID('Mystery box');
			await winner.addItemsToBank({ [box]: 1 });
			return msg.channel.send(
				`Congratulations, ${winner}! You got it. I've given you: **1x ${
					getOSItem(box).name
				}**.`
			);
		} catch (err) {
			return msg.channel.send(`Nobody got it! :(`);
		}
	}
}
