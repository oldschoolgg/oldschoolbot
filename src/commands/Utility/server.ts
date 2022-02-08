import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Get information on the current server.',
			examples: ['+server'],
			requiredPermissionsForBot: ['EMBED_LINKS'],
			runIn: ['text'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [guild = msg.guild!]) {
		const embed = new MessageEmbed()
			.setColor(16_098_851)
			.setThumbnail(guild.iconURL()!)
			.setAuthor(guild!.name)
			.addField('Total Members', guild!.memberCount.toString(), true)
			.addField('Server Creation Date', guild.createdAt.toLocaleDateString(), true)
			.addField('Bot Prefix', msg.cmdPrefix, true);

		return msg.channel.send({ embeds: [embed] });
	}
}
