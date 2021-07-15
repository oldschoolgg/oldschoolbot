import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			aliases: ['bl'],
			usage: '[collection:string]',
			examples: ['+inbank bosses'],
			description: 'Allows you to view all yout collection log items that you have in yout bank.',
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [collection]: [string]) {
		await msg.author.settings.sync(true);

		const result = await this.client.tasks.get('collectionLogTask')!.generateLogImage({
			user: msg.author,
			type: 'bank',
			flags: msg.flagArgs,
			collection
		});

		if (!(result instanceof MessageAttachment)) {
			return msg.channel.send(result);
		}
		return msg.channel.send({ files: [result as MessageAttachment] });
	}
}
