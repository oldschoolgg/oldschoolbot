import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send('This command is now in the `fake` command, e.g. `+fake bandos/zammy/arma, Magnaboy`');
	}
}
