import { GuildMember, MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Command {
	public timestamp = new Timestamp('d MMMM YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Get information on a mentioned user.',
			usage: '[Member:member]',
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	async run(msg: KlasaMessage, [member]: [GuildMember]) {
		if (!member) member = await msg.guild!.members.fetch(msg.author.id);
		const { user, joinedTimestamp } = member;
		const totalCommandsUsed = user.settings.get(UserSettings.TotalCommandsUsed);
		const commandsUsed = (totalCommandsUsed && totalCommandsUsed.toLocaleString()) || 0;

		const embed = new MessageEmbed()
			.setColor(16098851)
			.setThumbnail(member.user.displayAvatarURL())
			.setDescription(`${member.user.badges} **${member.user.username}**`)
			.addField('RuneScape Username', user.settings.get('RSN') || 'Not Set', true)
			.addField('Total Commands Used', commandsUsed, true)
			.addField('Discord Join Date', this.timestamp.display(user.createdAt), true);

		if (joinedTimestamp) {
			embed.addField('Server Join Date', this.timestamp.display(joinedTimestamp), true);
		}

		return msg.send({ embed });
	}
}
