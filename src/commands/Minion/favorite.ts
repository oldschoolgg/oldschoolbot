import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

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
		if (msg.flagArgs.clear) {
			await msg.author.settings.reset(UserSettings.FavoriteItems);
			return msg.send(`Reset your favorite items.`);
		}

		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);

		if (!items) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (currentFavorites.length === 0) {
				return msg.send(`You have no favorited items.`);
			}
			let b = new Bank();
			for (const id of currentFavorites) {
				b.add(id, 1);
			}
			return msg.channel.sendBankImage({
				bank: b.bank,
				title: `${msg.author.username}'s Favorites`
			});
		}

		const [item] = items;

		if (currentFavorites.includes(item.id)) {
			await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
				arrayAction: ArrayActions.Remove
			});
			return msg.send(`Removed ${item.name} from your favorite items.`);
		}

		if (currentFavorites.length >= 100) {
			return msg.send(`You cant favorite anymore items.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.send(`Added ${item.name} to your favorite items.`);
	}
}
