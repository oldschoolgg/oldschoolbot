import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(
			"You approach Koschei the deathless, he doesn't regard you as a threat, you eventually get scared and run away. Maybe another time."
		);
	}
}
