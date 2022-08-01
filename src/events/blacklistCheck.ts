import { Guild } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '../lib/blacklists';

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
		if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.ownerID)) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}
	}
}
