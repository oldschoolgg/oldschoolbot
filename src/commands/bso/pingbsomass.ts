import { CommandStore, KlasaMessage } from 'klasa';

import { Roles, SupportServer } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 60 * 5
		});
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (!msg.member) return;
		if (!msg.member.roles.has('759572886364225558') && !msg.member.roles.has(Roles.Moderator)) {
			return;
		}
		return msg.send(
			`<@&759573020464906242> - *Note: You can type \`.roles bso-mass\` to remove, or add, this role to yourself.`
		);
	}
}
