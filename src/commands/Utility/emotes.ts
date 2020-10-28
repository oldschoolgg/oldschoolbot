import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

const servers = `
https://discord.gg/Tc3cdbc
https://discord.gg/qrEmgZU
https://discord.gg/qBF9XFG
https://discord.gg/PW5WuRS
https://discord.gg/JdZAQqA
https://discord.gg/6C5T3Xh
https://discord.gg/nfzkxFZ`;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['emoteservers'],
			description: 'Shows the invites to all the OSRS Emoji discord servers.',
			examples: ['+emotes'],
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage) {
		const embed = new MessageEmbed()
			.setTitle('Emote Servers')
			.setColor(14981973)
			.setThumbnail(this.client?.user?.displayAvatarURL() || '')
			.setDescription(servers);

		return msg.send({ embed });
	}
}
