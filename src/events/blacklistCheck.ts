import { Event, EventStore, KlasaGuild } from 'klasa';

import { ClientSettings } from '../lib/settings/types/ClientSettings';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'guildCreate'
		});
		this.enabled = this.client.production;
	}

	run(guild: KlasaGuild) {
		if (!guild.available) return;
		if (
			this.client.settings.get(ClientSettings.GuildBlacklist).includes(guild.id) ||
			this.client.settings.get(ClientSettings.UserBlacklist).includes(guild.ownerID)
		) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}
	}
}
