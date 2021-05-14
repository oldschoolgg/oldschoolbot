import { CommandStore, KlasaMessage } from 'klasa';

import { Roles } from '../../lib/constants';
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
			(!msg.member.roles.has(Roles.Moderator) && !msg.member.roles.has(Roles.Contributor))
		) {
			return;
		}
		return msg.send('<@&682052620809928718>');
	}
}
