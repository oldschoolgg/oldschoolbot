import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import { collectionLogTypes } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/constants';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 10,
			aliases: ['cl'],
			usage: '[type:string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [inputType = 'all']) {
		const type = collectionLogTypes.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type) {
			throw `That's not a valid collection log type. The valid types are: ${collectionLogTypes
				.map(type => type.name)
				.join(', ')}`;
		}

		const items = Object.values(type.items).flat(100);
		const log: number[] = msg.author.settings.get(UserSettings.CollectionLog);
		const num = items.filter(item => log.includes(item)).length;

		msg.channel.send(
			new MessageAttachment(
				await this.client.tasks
					.get('bankImage')
					.generateCollectionLogImage(
						log,
						`${msg.author.username}'s ${type.name} Collection Log (${num}/${items.length})`,
						type
					)
			)
		);
	}
}
