import { CommandStore, KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		const bank = msg.author.settings.get(UserSettings.Bank);

		const brokenBank = [];
		for (const id of Object.keys(bank).map(key => parseInt(key))) {
			const item = Items.get(id);
			if (!item) {
				brokenBank.push(id);
			}
		}

		const favorites = msg.author.settings.get(UserSettings.FavoriteItems);
		const brokenFavorites: number[] = [];
		for (const id of favorites) {
			const item = Items.get(id);
			if (!item) {
				brokenFavorites.push(id);
			}
		}

		if (msg.flagArgs.fix) {
			let str = '';
			const newFavs = favorites.filter(i => !brokenFavorites.includes(i));
			await msg.author.settings.update(UserSettings.FavoriteItems, newFavs, {
				arrayAction: 'overwrite'
			});
			str += `Removed ${favorites.length - newFavs.length} from favorites\n`;

			const newBank = { ...bank };
			for (const id of brokenBank) {
				str += `Removed ${newBank[id]}x of item ID ${id} from bank\n`;
				delete newBank[id];
			}
			await msg.author.settings.update(UserSettings.Bank, newBank);
			return msg.channel.send(str);
		}

		return msg.send(
			[
				`You have ${brokenBank.length} broken items in your bank. `,
				`You have ${brokenBank.length} broken items in your favorites. `,
				`You can use \`=checkbank --fix\` to try to automatically remove the broken items.`,
				`Check here to potentially see what they are: <https://chisel.weirdgloop.org/moid/item_id.html#${[
					...brokenBank,
					...brokenFavorites
				].join(',`')}`
			].join('\n')
		);
	}
}
