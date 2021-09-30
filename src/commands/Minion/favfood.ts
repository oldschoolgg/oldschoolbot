import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { Eatables } from '../../lib/data/eatables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:item]',
			description: 'Favorites an item to be prioritized as food.',
			examples: ['+favfood shark'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [items]: [Item[] | undefined]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteFood);

		if (!items || items.length === 0) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteFood);
			if (currentFavorites.length === 0) {
				return msg.channel.send('You have no favorited food.');
			}
			return msg.channel.send(
				`Your current favorite food are: ${currentFavorites.map(id => itemNameFromID(id)).join(', ')}.`
			);
		}

		const [item] = items;

		if (!Eatables.some(eatable => item.id === eatable.id)) {
			return msg.channel.send("That item isn't a valid food.");
		}

		if (currentFavorites.includes(item.id)) {
			await msg.author.settings.update(UserSettings.FavoriteFood, item.id, {
				arrayAction: ArrayActions.Remove
			});
			return msg.channel.send(`Removed ${item.name} from your favorite food.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteFood, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.channel.send(`Added ${item.name} to your favorite food.`);
	}
}
