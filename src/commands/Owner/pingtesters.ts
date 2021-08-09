import { CommandStore, KlasaMessage } from 'klasa';

import { DefaultPingableRoles, Roles } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pt']
		});
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (
			!msg.guild ||
			msg.channel.id !== '680770361893322761' ||
			!msg.member ||
			(!msg.member.roles.cache.has(Roles.Moderator) && !msg.member.roles.cache.has(Roles.Contributor))
		) {
			return;
		}
		return msg.channel.send(`<@&${DefaultPingableRoles.BSOTester}>`);
	}
}
