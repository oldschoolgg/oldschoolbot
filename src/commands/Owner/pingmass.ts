import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { DefaultPingableRoles, Roles, SupportServer } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pm'],
			cooldown: 60 * 5
		});
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (!msg.member) return;
		if (!(msg.channel instanceof TextChannel)) return;
		if (!msg.member.roles.cache.has(Roles.BSOMassHoster) && !msg.member.roles.cache.has(Roles.Moderator)) {
			return;
		}

		return msg.channel.send(`<@&${DefaultPingableRoles.BSOMass}>`);
	}
}
