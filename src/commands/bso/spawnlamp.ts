import { MessageEmbed } from 'discord.js';
import { randInt, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { convertXPtoLVL } from 'oldschooljs/dist/util';

import { Color, PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { LampTable } from '../../lib/xpLamps';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four,
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== '342983479501389826') {
			return msg.send(`You can only do this in the Oldschool.gg server.`);
		}
		const currentDate = Date.now();
		const lastDate = msg.author.settings.get(UserSettings.LastSpawnLamp);
		const difference = currentDate - lastDate;

		const cooldown = [PerkTier.Six, PerkTier.Five].includes(msg.author.perkTier)
			? Time.Hour * 12
			: Time.Hour * 24;

		if (difference < cooldown && msg.author.id !== '157797566833098752') {
			const duration = formatDuration(Date.now() - (lastDate + cooldown));
			return msg.send(`You can spawn another lamp in ${duration}.`);
		}
		await msg.author.settings.update(UserSettings.LastSpawnLamp, currentDate);

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
