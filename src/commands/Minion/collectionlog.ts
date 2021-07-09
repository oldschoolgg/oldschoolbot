import { MessageAttachment } from 'discord.js';
import { chunk, uniqueArr } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { bosses, collectionLogTypes } from '../../lib/data/collectionLog';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, stringMatches } from '../../lib/util';

const slicedCollectionLogTypes = collectionLogTypes.filter(i => i.name !== 'Overall');

const allCollectionLogItems = uniqueArr(
	collectionLogTypes
		.filter(i => !['Holiday', 'Diango', 'Overall', 'Capes', 'Clue Hunter'].includes(i.name))
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
			const { percent, notOwned, owned, debugBank } = msg.author.completion();
			if (msg.flagArgs.debug) {
				return msg.channel.sendBankImage({
					bank: debugBank.bank,
					title: 'All Items That Count Towards CL %',
					flags: { debug: 1 }
				});
			}
			return msg.channel.send(
				`You have ${owned.length}/${allCollectionLogItems.length} (${percent.toFixed(
					2
				)}%) Collection Log Completion.
				
Go collect these items! ${notOwned.map(itemNameFromID).join(', ')}.`
			);
		}

		await msg.author.settings.sync(true);

		const monster = killableMonsters.find(
			_type => stringMatches(_type.name, inputType) || _type.aliases.some(name => stringMatches(name, inputType))
		);

		const type = slicedCollectionLogTypes.find(
			_type => stringMatches(_type.name, inputType) || _type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type && !monster) {
			return msg.channel.send(
				`That's not a valid collection log type. The valid types are: ${slicedCollectionLogTypes
					.map(type => type.name)
					.join(', ')}`
			);
		}

		let items = Array.from(
			new Set(Object.values(type?.items ?? Monsters.get(monster!.id)!.allItems!).flat(100))
		) as number[];
		const log = msg.author.settings.get(UserSettings.CollectionLogBank);
		const { name } = type || monster!;

		// Add Sire uniques that come from Unsired.
		if (stringMatches('abyssal sire', name)) {
			items.unshift(...bosses['Abyssal Sire']);
			items = [...new Set(items)];
		}

		// Count number of items the player owns in CL.
		const num = items.filter(item => log[item] > 0).length;

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
			return msg.channel.send({ files: [attachment] });
		}

		return msg.channel.send({ content: `Your ${kcName} KC is: ${kcAmount}.`, files: [attachment] });
	}
}
