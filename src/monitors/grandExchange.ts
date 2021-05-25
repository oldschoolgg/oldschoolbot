import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { Channel, SupportServer } from '../lib/constants';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: true, ignoreOthers: false });
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			(msg.channel.id !== Channel.GrandExchange && msg.channel.id !== '738780181946171493')
		) {
			return;
		}

		if (
			['buying', 'selling', 'trading', 'trade', 'swap', 'swapping'].every(
				str => !msg.content.toLowerCase().includes(str)
			) ||
			msg.content.split(/\r\n|\r|\n/).length > 10 ||
			msg.cleanContent.length > 450
		) {
			await msg.delete();
			await msg.author.send(
				`Your message was automatically removed from the grand exchange channel, because it was either over 10 lines long OR over 450 characters long. Please take a second to read the rules here: https://discordapp.com/channels/342983479501389826/682996313209831435/706772870923288618`
			);
		}
	}
}
