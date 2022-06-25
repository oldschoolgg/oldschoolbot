import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send('**Important:** Kalphite King is now in the `/k` slash command, just search for it!');
	}
}
