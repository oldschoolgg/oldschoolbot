import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { getGuildSettings, getGuildSettingsCached } from '../lib/settings/settings';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: true, ignoreOthers: false });
	}

	public async run(msg: KlasaMessage) {
		if (msg.guild) {
			const cachedSettings = getGuildSettingsCached(msg.guild);
			console.log({ cachedSettings });
			if (!cachedSettings) {
				const t = await getGuildSettings(msg.guild);
				console.log({ t });
			}
		}
	}
}
