import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { Channel, Emoji, SupportServer } from '../lib/constants';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: true, ignoreOthers: false });
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
