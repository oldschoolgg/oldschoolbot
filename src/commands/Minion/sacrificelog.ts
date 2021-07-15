import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			aliases: ['sl'],
			usage: '[type:string]',
			categoryFlags: ['minion'],
			description: "The same thing as the collection log, except sourced from the items you've sacrificed.",
			examples: ['+sacrificelog boss', '+sl skilling']
		});
	}

	async run(msg: KlasaMessage, [inputType = '']) {
		await msg.author.settings.sync(true);
		const result = await this.client.tasks.get('collectionLogTask')!.generateLogImage({
			user: msg.author,
			type: 'sacrifice',
			flags: msg.flagArgs,
			collection: inputType
		});
		if (!(result instanceof MessageAttachment)) {
			return msg.channel.send(result);
		}
		return msg.channel.send({ files: [result as MessageAttachment] });
	}
}
