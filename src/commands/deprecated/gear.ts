import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(`The gear command has been moved to a slash command.
Viewing a gear setup: \`/gear view:Melee\`
Viewing all gear: \`/gear view:All\`
Swapping gear: \`/gear swap first:Melee second:Mage\``);
	}
}
