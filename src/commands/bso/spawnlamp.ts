import { MessageEmbed } from 'discord.js';
import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { convertXPtoLVL } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { Color, PerkTier } from '../../lib/constants';
import getOSItem from '../../lib/util/getOSItem';
import { LampTable } from '../../lib/xpLamps';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four,
			cooldown: 60 * 45,
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		if (msg.author.id !== '157797566833098752') {
			return msg.send(`Sucessfully deleted all items from your bank.`);
		}

		const xp = randInt(1, 13_400_000);
		const level = convertXPtoLVL(xp);

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(`https://static.runelite.net/cache/item/icon/11157.png`)
			.setTitle(
				`Answer me this, for a random XP Lamp! What level would you be at with ${xp} XP?`
			);

		await msg.channel.send(embed);

		try {
			const collected = await msg.channel.awaitMessages(
				_msg => _msg.content === level.toString(),
				{
					max: 1,
					time: 14_000,
					errors: ['time']
				}
			);

			const col = collected.first();
			if (!col) return;
			const winner = col.author!;
			const box = LampTable.roll()[0].item;
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
