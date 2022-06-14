import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse } from '../../lib/util';
import CollectionLogTask from '../../tasks/collectionLogTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sl'],
			usage: '[type:string]',
			categoryFlags: ['minion'],
			description: "The same thing as the collection log, except sourced from the items you've sacrificed.",
			examples: ['+sacrificelog boss', '+sl skilling']
		});
	}

	async run(msg: KlasaMessage, [inputType = '']) {
		const result = await (this.client.tasks.get('collectionLogTask') as CollectionLogTask)!.generateLogImage({
			user: msg.author,
			type: 'sacrifice',
			flags: msg.flagArgs,
			collection: inputType
		});
		return msg.channel.send(convertMahojiResponseToDJSResponse(result));
	}
}
