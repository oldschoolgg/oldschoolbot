import { GuildMember } from 'discord.js';
import { Event, EventStore } from 'klasa';

import { Roles, SupportServer } from '../lib/constants';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'guildMemberUpdate'
		});
	}

	async run(oldMember: GuildMember, newMember: GuildMember) {
		if (oldMember.guild.id !== SupportServer) return;
		if (!oldMember.roles.has(Roles.Patron) && newMember.roles.has(Roles.Patron)) {
			this.client.tasks.get('patreon')?.run();
		}
	}
}
