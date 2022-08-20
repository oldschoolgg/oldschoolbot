import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'This command has been removed. You can check the info of a user using another bot, such as Skyra: <https://skyra.pw/>'
		);
	}
}
