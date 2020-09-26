import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

const servers = `
[Old School RuneScape](https://discord.gg/gbfNeqd)
Official Old School server

[IronScape](https://discord.gg/dpKvnbb)
Community for ironmen

[We Do Raids](https://discord.gg/gREZC7f)
Raiding community

[Skilling Methods](https://discord.gg/e2effBN)
Show/discuss different skill training methods

[Gear](https://discord.gg/7KZHZ38)
Show/discuss different gear setups for PVM

[RuneLite](https://discord.gg/mePCs8U)
Official RuneLite client server`;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['servers', 'communities', 'community'],
			description: 'Shows some community servers related to OSRS.',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage) {
		const embed = new MessageEmbed()
			.setTitle('Community Servers')
			.setColor(14981973)
			.setThumbnail(this.client?.user?.displayAvatarURL() || '')
			.setDescription(servers);

		return msg.send({ embed });
	}
}
