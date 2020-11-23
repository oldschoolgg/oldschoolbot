import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { generatePrayerImage } from '../../lib/minions/functions/generatePrayerImage';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			description: 'Shows your selected prayer.',
			examples: ['+prayersetup'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage) {
		const image = await generatePrayerImage(this.client, msg.author);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
