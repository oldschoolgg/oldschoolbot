import { Monitor, KlasaClient, MonitorStore, KlasaMessage } from 'klasa';

import { SupportServer, Channel, Emoji } from '../lib/constants';

export default class extends Monitor {
	public constructor(
		client: KlasaClient,
		store: MonitorStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, { enabled: true, ignoreOthers: false });
	}

	async run(msg: KlasaMessage) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			msg.channel.id !== Channel.Suggestions
		) {
			return;
		}

		await msg.react(Emoji.ThumbsUp);
		await msg.react(Emoji.ThumbsDown);
	}
}
