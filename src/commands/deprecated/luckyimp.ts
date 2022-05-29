import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'This command has been removed, you can simulate Lucky Implings (and others) using: https://oldschool.gg/implings'
		);
	}
}
