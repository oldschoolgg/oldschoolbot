import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:item]',
			description: 'Favorites an item to be used in alching.',
			examples: ['+favalch rune platebody'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [items]: [Item[] | undefined]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteAlchables);

		if (!items) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteAlchables);
			if (currentFavorites.length === 0) {
				return msg.send(`You have no favorited alchable items.`);
			}
			return msg.send(
				`Your current favorite alchable items are: ${currentFavorites
					.map(id => itemNameFromID(id))
					.join(', ')}.`
			);
		}

		const [item] = items;

		if (!item.highalch) {
			return msg.channel.send(`That item isn't alchable.`);
		}

		if (currentFavorites.includes(item.id)) {
			await msg.author.settings.update(UserSettings.FavoriteAlchables, item.id, {
				arrayAction: ArrayActions.Remove
			});
			return msg.send(`Removed ${item.name} from your favorite alchable items.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteAlchables, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.send(`Added ${item.name} to your favorite alchable items.`);
	}
}
