import { MessageAttachment } from 'discord.js';
import { chunk } from 'e';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { fromKMB } from 'oldschooljs/dist/util';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { itemNameFromID } from '../../lib/util';

interface IParsedItem {
	qty: number;
	item: Item;
}
function customItemParse(str: string): IParsedItem[] {
	const parsedItems = str
		? str
				.split(',')
				.map(s => {
					let _s = s.trim();
					const _e = _s.split(' ');
					let _q = fromKMB(_e[0]);
					if (!isNaN(_q) && _e.length > 1) {
						_e.shift();
					} else {
						_q = 1;
					}
					_s = _e.join(' ');
					const forcedID = Number(_s) === parseInt(_s);
					const _i = Items.get(forcedID ? Number(_s) : _s);
					if (_i) {
						return {
							qty: _q,
							item: _i
						};
					}
				})
				.filter(f => f)
		: [];
	return parsedItems as IParsedItem[];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:...string]',
			description: 'Favorites an item to be used in alching.',
			examples: ['+favalch rune platebody', '+favalch rune platebody, dragon halberd, dragon longsword'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [str]: [string]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteAlchables);
		const newFavorites: number[] = [...currentFavorites];
		const items = customItemParse(str);
		if (!str || items.length === 0) {
			if (currentFavorites.length === 0) return msg.channel.send('You have no favorited alchable items.');
			if (msg.flagArgs.text) {
				return msg.channel.send(
					`Your current favorite alchable items are: ${chunk(
						currentFavorites.map(id => itemNameFromID(id)),
						50
					)
						.map(m => m.join(', '))
						.join('\n')}.`
				);
			}
			const imageBank: ItemBank = {};
			for (const i of newFavorites) imageBank[i] = 0;
			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(imageBank, 'Your current favorite alchable items', false, { id: 'yes' }, msg.author);
			return msg.channel.send({ files: [new MessageAttachment(image!, 'youFavoriteItems.png')] });
		}

		const dupeCheck: number[] = [];
		const cantAlchItems: string[] = [];
		const removed: string[] = [];
		const added: string[] = [];

		for (const i of items) {
			const { item } = i;
			if (dupeCheck.includes(item.id)) continue;
			if (!item.highalch) {
				cantAlchItems.push(item.name);
				continue;
			}
			if (newFavorites.includes(item.id)) {
				newFavorites.splice(newFavorites.indexOf(item.id), 1);
				removed.push(`${item.name} (${item.id})`);
			} else {
				newFavorites.push(item.id);
				added.push(`${item.name} (${item.id})`);
			}
			dupeCheck.push(item.id);
		}

		if (msg.author.settings.get(UserSettings.FavoriteAlchables) !== newFavorites) {
			await msg.author.settings.update(UserSettings.FavoriteAlchables, newFavorites, {
				arrayAction: ArrayActions.Overwrite
			});
			return msg.channel.send(
				`Updated your alch favorites.${
					added.length > 0 ? `\nAdded the following items: ${added.join(', ')}` : ''
				}${removed.length > 0 ? `\nRemoved the following items: ${removed.join(', ')}` : ''}${
					cantAlchItems.length > 0 ? `\nThe following items can't be alched: ${cantAlchItems.join(', ')}` : ''
				}`
			);
		}
		return msg.channel.send('Nothing changed on your alch favorites.');
	}
}
