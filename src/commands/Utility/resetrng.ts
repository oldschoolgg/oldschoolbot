import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(`Reset your accounts' RNG.`);
	}
}
