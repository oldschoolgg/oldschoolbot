import { GuildMember } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { SupportServer } from '../config';
import { Roles } from '../lib/constants';
import { patreonTask } from '../lib/patreon';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'guildMemberUpdate'
		});
	}

	async run(oldMember: GuildMember, newMember: GuildMember) {
		if (oldMember.guild.id !== SupportServer) return;
		if (!oldMember.roles.cache.has(Roles.Patron) && newMember.roles.cache.has(Roles.Patron)) {
			patreonTask.run();
		}
	}
}
