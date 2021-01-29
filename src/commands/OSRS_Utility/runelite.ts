import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rl'],
			description: 'Shows information on RuneLite',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+runelite']
		});
	}

	async run(msg: KlasaMessage) {
		const embed = new MessageEmbed()
			.setTitle('<:RuneLite:418690749719117834> RuneLite')
			.setColor(16098851)
			.setThumbnail('https://runelite.net/img/logo.png')
			.setURL('https://runelite.net/')
			.setDescription(
				`RuneLite is a free, open source and lightweight client for Old School RuneScape.

The biggest benefit of RuneLite is that it is open-source, so: it is safer because anyone can see the code, anyone around the world can contribute new features to it, and improve the code.

https://runelite.net/`
			)
			.addField('Free', '100% Free for all', true)
			.addField('Open Source', 'https://github.com/runelite/runelite', true)
			.addField('Lightweight & fast', 'No lag, little memory usage', true)
			.addField('Many Features', 'https://runelite.net/features', true)
			.setFooter(`*Use of any 3rd party client is at your own risk.`);

		return msg.send({ embed });
	}
}
