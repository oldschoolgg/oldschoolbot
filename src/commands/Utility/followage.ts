import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { SKYRA_DEPRECATED_COMMAND } from '../../lib/constants';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.send(SKYRA_DEPRECATED_COMMAND);
	}
}
