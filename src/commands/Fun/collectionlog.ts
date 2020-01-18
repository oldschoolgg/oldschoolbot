import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import { bosses } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 5,
			aliases: ['cl'],
			usage: '[bosses]',
			subcommands: true,
			usageDelim: ' '
		});
	}

	async bosses(msg: KlasaMessage) {
		const items = Object.values(bosses).flat();
		const log = msg.author.settings.get(UserSettings.CollectionLog);
		const num = items.filter(item => log.includes(item)).length;

		msg.channel.send(
			new MessageAttachment(
				await this.client.tasks
					.get('bankImage')
					.generateCollectionLogImage(
						log,
						`${msg.author.username}'s Boss Collection Log (${num}/${items.length})`
					)
			)
		);
	}
}
