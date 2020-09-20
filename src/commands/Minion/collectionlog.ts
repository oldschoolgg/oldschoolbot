import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { collectionLogTypes } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { stringMatches } from '../../lib/util';

const slicedCollectionLogTypes = collectionLogTypes.slice(1);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			aliases: ['cl'],
			usage: '[type:string]'
		});
	}

	async run(msg: KlasaMessage, [inputType = 'all']) {
		await msg.author.settings.sync(true);
		const type = slicedCollectionLogTypes.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type) {
			throw `That's not a valid collection log type. The valid types are: ${slicedCollectionLogTypes
				.map(type => type.name)
				.join(', ')}`;
		}

		const items = Object.values(type.items).flat(100);
		const log = msg.author.settings.get(UserSettings.CollectionLogBank);
		const num = items.filter(item => log[item] > 0).length;

		msg.channel.send(
			new MessageAttachment(
				await this.client.tasks
					.get('bankImage')!
					.generateCollectionLogImage(
						log,
						`${msg.author.username}'s ${type.name} Collection Log (${num}/${items.length})`,
						type
					)
			)
		);
	}
}
