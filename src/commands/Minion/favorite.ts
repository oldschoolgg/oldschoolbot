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
			return msg.channel.send('Reset your favorite items.');
		}

		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);

		if (!items || items.length === 0) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (currentFavorites.length === 0) {
				return msg.channel.send('You have no favorited items.');
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
			return msg.channel.send(`Removed ${item.name} from your favorite items.`);
		}

		let limit = (msg.author.perkTier + 1) * 100;
		if (currentFavorites.length >= limit) {
			return msg.channel.send(`You cant favorite anymore items, you can favorite a maximum of ${limit}.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.channel.send(`Added ${item.name} to your favorite items.`);
	}
}
