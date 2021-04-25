import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, chunk, uniqueArr } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MersenneTwister19937, shuffle } from 'random-js';

import { collectionLogTypes } from '../../lib/data/collectionLog';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, stringMatches } from '../../lib/util';

const slicedCollectionLogTypes = collectionLogTypes.slice(0, collectionLogTypes.length - 1);

export function shuffleRandom<T>(input: number, arr: T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

const allCollectionLogItems = uniqueArr(
	collectionLogTypes
		.filter(i => !['Holiday', 'Diango', 'Overall'].includes(i.name))
		.map(i => Object.values(i.items))
		.flat(Infinity) as number[]
);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			aliases: ['cl'],
			usage: '[type:string]',
			examples: ['+cl boss'],
			description: 'Allows you to view your collection log, which works the same as ingame.',
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [inputType]: [string]) {
		if (!inputType) {
			const clItems = Object.keys(
				msg.author.settings.get(UserSettings.CollectionLogBank)
			).map(i => parseInt(i));
			const clExclusive = clItems.filter(i => allCollectionLogItems.includes(i));
			const notOwned = shuffleRandom(
				Number(msg.author.id),
				allCollectionLogItems.filter(i => !clItems.includes(i))
			).slice(0, 10);
			return msg.send(
				`You have **${calcWhatPercent(
					clExclusive.length,
					allCollectionLogItems.length
				).toFixed(2)}%** Collection Log Completion.
				
Go collect these items! ${notOwned.map(itemNameFromID).join(', ')}.`
			);
		}

		await msg.author.settings.sync(true);

		const monster = killableMonsters.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		const type = slicedCollectionLogTypes.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type && !monster) {
			return msg.send(
				`That's not a valid collection log type. The valid types are: ${slicedCollectionLogTypes
					.map(type => type.name)
					.join(', ')}`
			);
		}

		const items = Array.from(
			new Set(Object.values(type?.items ?? Monsters.get(monster!.id)!.allItems!).flat(100))
		) as number[];
		const log = msg.author.settings.get(UserSettings.CollectionLogBank);
		const num = items.filter(item => log[item] > 0).length;
		const { name } = type || monster!;

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
					`${msg.author.username}'s ${name} Collection Log (${num}/${items.length})`,
					monster ? { ...monster, items: chunkedMonsterItems } : type
				)
		);

		const [kcName, kcAmount] = await msg.author.getKCByName(name);

		if (!kcName) {
			return msg.send(attachment);
		}

		return msg.send(`Your ${kcName} KC is: ${kcAmount}.`, attachment);
	}
}
