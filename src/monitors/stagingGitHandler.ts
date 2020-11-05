import { KlasaMessage, Monitor, MonitorStore, util } from 'klasa';

import { staging } from '../config';
import { Channel } from '../lib/constants';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreBots: false,
			ignoreEdits: true,
			ignoreSelf: true
		});
		this.enabled = staging;
	}

	async run(msg: KlasaMessage) {
		if (msg.channel.id !== Channel.Developers) return;
		if (msg.webhookID !== '721651397699043382') return;
		if (!msg.embeds || !msg.embeds[0]) return;
		if (!msg.embeds[0].title.includes('[oldschoolbot:staging]')) return;

		try {
			await util.exec('yarn');
			await util.exec('git fetch && git pull');

			// @ts-ignore
			await this.client.commands.get('reload')!.everything!({
				sendLocale: () => null,
				sendMessage: () => null,
				send: () => null
			});
			await msg.channel.send(`Finished updating.`);
		} catch (err) {
			return msg.channel.send(`Failed to pull and reload these changes!`);
		}
	}
}
