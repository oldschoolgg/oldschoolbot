import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Roles, SupportServer } from '../../lib/constants';

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
		if (!msg.member.roles.has('734055552933429280') && !msg.member.roles.has(Roles.Moderator)) {
			return;
		}
		return msg.send('<@&711215501543473182>');
	}
}
