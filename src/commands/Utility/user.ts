import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Get information on a mentioned user, or yourself.',
			examples: ['+user', '+user @Magnaboy'],
			usage: '[Member:member]',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			runIn: ['text'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [member]: [GuildMember]) {
		if (!member) member = await msg.guild!.members.fetch(msg.author.id);
		const { user } = member;

		const embed = new MessageEmbed()
			.setColor(16_098_851)
			.setThumbnail(user.displayAvatarURL())
			.setDescription(`${user.badges} **${user.username}**`)
			.addField('RuneScape Username', user.settings.get(UserSettings.RSN) || 'Not Set', true)
			.addField('Discord Join Date', user.createdAt.toLocaleDateString(), true)
			.addField('Server Join Date', member.joinedAt!.toLocaleDateString(), true);

		return msg.channel.send({ embeds: [embed] });
	}
}
