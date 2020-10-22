import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			`The current list of skills include: Agility, Cooking, Fishing, Mining, Smithing, Woodcutting, Firemaking, Runecrafting, Prayer, Fletching, Herblore\n
If you'd like to see the xp/hr charts visit discord.gg/ob and look in #faq`
		);
	}
}
