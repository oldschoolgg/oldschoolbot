import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse } from '../../lib/util';
import CollectionLogTask from '../../tasks/collectionLogTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bl'],
			usage: '[collection:string]',
			examples: ['+inbank bosses'],
			description: 'Allows you to view all you collection log items that you have in you bank.',
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [collection]: [string]) {
		const result = await (this.client.tasks.get('collectionLogTask')! as CollectionLogTask).generateLogImage({
			user: msg.author,
			type: 'bank',
			flags: msg.flagArgs,
			collection
		});
		return msg.channel.send(convertMahojiResponseToDJSResponse(result));
	}
}
