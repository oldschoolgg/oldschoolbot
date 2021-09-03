import { MessageAttachment } from 'discord.js';
import { chunk, deepClone } from 'e';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { COINS_ID } from '../../lib/constants';
import { getCollectionItems } from '../../lib/data/Collections';
import { filterableTypes } from '../../lib/data/filterables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { itemNameFromID, stringMatches } from '../../lib/util';
import { parseStringBank } from '../../lib/util/parseStringBank';

function chunkItemsToText(array: any[], showOnly: number = 11, chunkSize: number = 3) {
	return `${chunk(
		array.slice(0, showOnly).map(l => `\`${l}\``),
		chunkSize
	).join('\n')}${array.length > showOnly ? ` and ${array.length - showOnly} more items` : ''}.`;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:...string]',
			aliases: ['ignore', 'block', 'ignoreitem', 'blockitem'],
			description: 'Favorites an item so it displays at the top of your bank.',
			examples: ['+favorite twisted bow'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [str]: [string]) {
		const currentIgnoredItems = [...deepClone(msg.author.settings.get(UserSettings.IgnoredItems))];

		if (msg.flagArgs.clear) {
			if (currentIgnoredItems.length > 0) {
				await msg.confirm(
					`Are you sure you want to clear your ignored items list? You currently have ${currentIgnoredItems.length.toLocaleString()} favorite items.`
				);
				await msg.author.settings.update(UserSettings.IgnoredItems, [], {
					arrayAction: ArrayActions.Overwrite
				});
				return msg.channel.send(
					`You cleared your favorite items. Here is what you had in your favorite list: ${currentIgnoredItems
						.map(itemNameFromID)
						.join(', ')}.`
				);
			}
			return msg.channel.send('You dont have anything on your favorites to clear.');
		}

		// Apply custom rule for collection log/filters
		if (msg.flagArgs.filter) {
			const filterName = msg.flagArgs.filter;
			const filter = filterableTypes.find(
				f => stringMatches(f.name, filterName) || f.aliases.some(a => stringMatches(a, filterName))
			);
			if (filter) str += `, ${filter.items.join(', ')}`;
		}
		if (msg.flagArgs.collection) {
			const collectionName = msg.flagArgs.collection;
			const collection = getCollectionItems(collectionName);
			if (collection) str += `, ${collection.join(', ')}`;
		}

		const items = parseStringBank(str, false);

		if (!items || items.length === 0) {
			if (currentIgnoredItems.length === 0) return msg.channel.send('You have no ignored items.');
			if (msg.flagArgs.text) {
				const names: string[] = [];
				return msg.channel.send(
					`Your current ignored items are: ${currentIgnoredItems
						.sort((a, b) => a - b)
						.map(i => {
							const item = itemNameFromID(i);
							if (!item) return undefined;
							if (names.includes(item)) return `${i}`;
							names.push(item);
							return item;
						})
						.filter(f => f)
						.join(', ')}.`
				);
			}
			const imageBank: ItemBank = {};
			for (const i of currentIgnoredItems) imageBank[i] = 0;
			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(imageBank, 'Your current ignored items', false, { id: 'yes' }, msg.author);
			return msg.channel.send({
				files: [
					new MessageAttachment(
						image!,
						`${msg.author.username}_${msg.author.discriminator}_ignored_items.png`
					)
				]
			});
		}

		const added: string[] = [];
		const removed: string[] = [];

		for (const item of items) {
			const _i = item[0];
			if (_i.id === COINS_ID) continue;
			if (currentIgnoredItems.includes(_i.id)) {
				currentIgnoredItems.splice(currentIgnoredItems.indexOf(_i.id), 1);
				removed.push(`${_i.name} [${_i.id}]`);
			} else {
				currentIgnoredItems.push(_i.id);
				added.push(`${_i.name} [${_i.id}]`);
			}
		}

		await msg.author.settings.update(UserSettings.IgnoredItems, currentIgnoredItems, {
			arrayAction: ArrayActions.Overwrite
		});

		return msg.channel.send(
			`${added.length > 0 ? `\nAdded the following items to your ignore list:\n${chunkItemsToText(added)}` : ''}${
				removed.length > 0
					? `\nRemoved the following items to your ignore list:\n${chunkItemsToText(removed)}`
					: ''
			}`.trim()
		);
	}
}
