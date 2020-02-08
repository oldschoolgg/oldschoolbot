import { Event, EventStore, KlasaGuild } from 'klasa';

import { ClientSettings } from '../lib/ClientSettings';

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
			(guild.owner &&
				this.client.settings.get(ClientSettings.GuildBlacklist).includes(guild.owner.id))
		) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}
	}
}
