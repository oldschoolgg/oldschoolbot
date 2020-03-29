import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			`Need to buy or sell some items in the bot? Join the Old School Bot server and head to the #grand-exchange channel! discord.gg/ob\n
__**Make sure to read the pinned messages to understand how it works!**__`
		);
	}
}
