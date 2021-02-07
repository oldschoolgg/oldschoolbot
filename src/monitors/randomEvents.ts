import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { BitField } from '../lib/constants';
import { triggerRandomEvent } from '../lib/random_events/triggerRandomEvent';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { roll } from '../lib/util';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			enabled: true,
			ignoreBots: true,
			ignoreWebhooks: true,
			ignoreEdits: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		if (!msg.author.settings.get(UserSettings.BitField).includes(BitField.EnabledRandomEvents))
			return;

		if (msg.content.includes('--event')) {
			return triggerRandomEvent(msg.channel, msg.author);
		}
		if (!roll(400)) return;
		if (
			!msg.guild.settings.get(GuildSettings.RandomEventsEnabled) ||
			msg.guild.settings.get(GuildSettings.StaffOnlyChannels).includes(msg.channel.id)
		) {
			try {
				const dm = await msg.author.createDM();
				triggerRandomEvent(dm, msg.author);
			} catch (_) {}
			return;
		}
		return triggerRandomEvent(msg.channel, msg.author);
	}
}
