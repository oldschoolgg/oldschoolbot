import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.send(
			`You can invite the bot to your server using this link: <https://invite.oldschool.gg/>`
		);
	}
}
