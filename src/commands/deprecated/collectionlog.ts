import { CommandStore, KlasaMessage } from 'klasa';

import { allCLItemsFiltered, calcCLDetails } from '../../lib/data/Collections';
import { BotCommand } from '../../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse, itemNameFromID } from '../../lib/util';
import CollectionLogTask from '../../tasks/collectionLogTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			aliases: ['cl'],
			usage: '[collection:string]',
			examples: ['+cl boss'],
			description: 'Allows you to view your collection log, which works the same as ingame.',
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [collection]: [string]) {
		if (!collection) {
			const { percent, notOwned, owned } = calcCLDetails(msg.author);
			return msg.channel.send(
				`You have ${owned.length}/${allCLItemsFiltered.length} (${percent.toFixed(
					2
				)}%) Collection Log Completion.

Go collect these items! ${notOwned.map(itemNameFromID).join(', ')}.`
			);
		}
		const result = await (globalClient.tasks.get('collectionLogTask')! as CollectionLogTask).generateLogImage({
			user: msg.author,
			type: 'collection',
			flags: msg.flagArgs,
			collection
		});
		let converted = convertMahojiResponseToDJSResponse(result);
		if (typeof converted !== 'string') {
			let str =
				'This command will be removed soon as we fully migrate to slash commands - start using the `/cl` slash command!';
			if (!converted.content) converted.content = str;
			else converted.content += ` ${str}`;
		}
		return msg.channel.send(converted);
	}
}
