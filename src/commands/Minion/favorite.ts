import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:item]',
			aliases: ['fav', 'favourite'],
			description: 'Favorites an item so it displays at the top of your bank.',
			examples: ['+favorite twisted bow'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [items]: [Item[] | undefined]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);

		if (msg.flagArgs.clear) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (currentFavorites.length > 0) {
				await msg.confirm(
					`Are you sure you want to clear your favorite items list? You currently have ${currentFavorites.length.toLocaleString()} favorite items.`
				);
				await msg.author.settings.update(UserSettings.FavoriteItems, [], {
					arrayAction: ArrayActions.Overwrite
				});
				return msg.channel.send(
					`You cleared your favorite items. Here is what you had in your favorite list: ${currentFavorites
						.map(id => itemNameFromID(id))
						.join(', ')}.`
				);
			}
			return msg.channel.send('You dont have anything on your favorites to clear.');
		}

		if (!items || items.length === 0) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (currentFavorites.length === 0) {
				return msg.channel.send('You have no favorited items.');
			}
			return msg.channel.send(
				`Your current favorite items are: ${currentFavorites.map(id => itemNameFromID(id)).join(', ')}.`
			);
		}

		const [item] = items;

		if (currentFavorites.includes(item.id)) {
			await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
				arrayAction: ArrayActions.Remove
			});
			return msg.channel.send(`Removed ${item.name} from your favorite items.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.channel.send(`Added ${item.name} to your favorite items.`);
	}
}
