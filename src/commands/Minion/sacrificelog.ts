import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { collectionLogTypes } from '../../lib/data/collectionLog';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const slicedCollectionLogTypes = collectionLogTypes.filter(i => i.name !== 'Overall');

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

		const monster = killableMonsters.find(_type => _type.aliases.some(name => stringMatches(name, inputType)));

		const type =
			inputType === ''
				? collectionLogTypes.find(i => i.name === 'Overall')
				: slicedCollectionLogTypes.find(_type => _type.aliases.some(name => stringMatches(name, inputType)));

		if (!type && !monster) {
			return msg.channel.send(
				`That's not a valid collection log type. The valid types are: ${slicedCollectionLogTypes
					.map(type => type.name)
					.join(', ')}`
			);
		}

		const items = Array.from(
			new Set(Object.values(type?.items ?? Monsters.get(monster!.id)!.allItems!).flat(100))
		) as number[];
		const log = msg.author.settings.get(UserSettings.SacrificedBank);
		const num = items.filter(item => log[item] > 0).length;

		if (inputType === '') {
			return msg.channel.send(
				`You have ${num}/${items.length} (${calcWhatPercent(num, items.length).toFixed(
					2
				)}%) Sacrifice Log Completion.`
			);
		}

		const chunkedMonsterItems: Record<number, number[]> = {};
		let i = 0;
		if (monster) {
			for (const itemChunk of chunk(items, 12)) {
				chunkedMonsterItems[++i] = itemChunk;
			}
		}

		const attachment = new MessageAttachment(
			await this.client.tasks
				.get('bankImage')!
				.generateCollectionLogImage(
					log,
					`${msg.author.username}'s ${(type || monster!).name} Sacrifice Log (${num}/${items.length})`,
					monster ? { ...monster, items: chunkedMonsterItems } : type
				)
		);

		return msg.channel.send({ files: [attachment] });
	}
}
