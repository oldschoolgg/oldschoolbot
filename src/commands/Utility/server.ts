import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';

import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Get information on a mentioned user.',
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	async run(msg: KlasaMessage, [guild = msg.guild!]) {
		const embed = new MessageEmbed()
			.setColor(16098851)
			.setThumbnail(guild.iconURL()!)
			.setAuthor(guild!.name)
			.addField('Total Members', guild!.memberCount, true)
			.addField('Server Creation Date', guild.createdAt.toLocaleDateString(), true)
			.addField('Bot Prefix', guild.settings.get(GuildSettings.Prefix), true);

		return msg.send({ embed });
	}
}
