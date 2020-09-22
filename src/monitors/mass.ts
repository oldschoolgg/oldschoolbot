import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { SupportServer } from '../lib/constants';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: true, ignoreOthers: false });
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			msg.channel.id !== '757683928751407224'
		) {
			return;
		}
		if (
			['mass', 'pingmass', 'groupkill'].every(
				str =>
					!msg.content
						.toLowerCase()
						.trim()
						.startsWith(`${this.client.options.prefix}${str}`)
			)
		) {
			await msg.delete();
		}
	}
}
