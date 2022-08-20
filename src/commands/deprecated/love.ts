import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel
			.send(`The love command has been removed, sorry! The command is available in Skyra though: <https://skyra.pw/>.
Old School Bot loves you 100%! ❤️`);
	}
}
