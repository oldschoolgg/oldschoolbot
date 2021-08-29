import { MessageAttachment } from 'discord.js';
import { chunk } from 'e';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { itemNameFromID } from '../../lib/util';
import { parseStringBank } from '../../lib/util/parseStringBank';

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
		const items = parseStringBank(str);
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

		const dupeCheck: string[] = [];
		const cantAlchItems: string[] = [];
		const removed: string[] = [];
		const added: string[] = [];
		for (const [item] of items) {
			if (dupeCheck.includes(item.name)) continue;
			if (!item.highalch) {
				cantAlchItems.push(item.name);
				continue;
			}
			if (newFavorites.includes(item.id)) {
				newFavorites.splice(newFavorites.indexOf(item.id), 1);
				removed.push(item.name);
			} else {
				newFavorites.push(item.id);
				added.push(item.name);
			}
			dupeCheck.push(item.name);
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
