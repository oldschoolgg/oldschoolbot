import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { allCLItemsFiltered } from '../../lib/data/Collections';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';

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
		await msg.author.settings.sync(true);

		if (!collection) {
			const { percent, notOwned, owned, debugBank } = msg.author.completion();
			if (msg.flagArgs.debug) {
				return msg.channel.sendBankImage({
					bank: debugBank,
					title: 'All Items That Count Towards CL %',
					flags: { debug: 1 }
				});
			}
			return msg.channel.send(
				`You have ${owned.length}/${allCLItemsFiltered.length} (${percent.toFixed(
					2
				)}%) Collection Log Completion.

Go collect these items! ${notOwned.map(itemNameFromID).join(', ')}.`
			);
		}
		const result = await this.client.tasks.get('collectionLogTask')!.generateLogImage({
			user: msg.author,
			type: 'collection',
			flags: msg.flagArgs,
			collection
		});
		if (!(result instanceof MessageAttachment)) {
			return msg.channel.send(result);
		}
		return msg.channel.send({ files: [result as MessageAttachment] });
	}
}
