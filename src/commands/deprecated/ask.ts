import { KlasaMessage } from 'klasa';

import { COMMAND_BECAME_SLASH_COMMAND_MESSAGE } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			`You now use this command using: \`/lms simulate\`
${COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg)}`
		);
	}
}
