import { Guild } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { ClientSettings } from '../lib/settings/types/ClientSettings';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'guildCreate'
		});
		this.enabled = this.client.production;
	}

	run(guild: Guild) {
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
