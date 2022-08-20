import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'Claiming dailies has been moved to `/minion daily`, BUT you can also claim it from just clicking a button in `+m`'
		);
	}
}
