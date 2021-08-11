import { MessageAttachment } from 'discord.js';
import { deepClone, objectEntries, objectKeys, objectValues } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { parseStringBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:...string]',
			aliases: ['fav', 'favourite'],
			description: 'Favorites an item so it displays at the top of your bank.',
			examples: ['+favorite twisted bow'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [items]: [string | undefined]) {
		const currentFavorites = { ...deepClone(msg.author.settings.get(UserSettings.FavoriteItems)) };

		if (msg.flagArgs.clear) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (objectKeys(currentFavorites).length > 0) {
				await msg.confirm(
					`Are you sure you want to clear your favorite items list? You currently have ${objectKeys(
						currentFavorites
					).length.toLocaleString()} favorite items.`
				);
				await msg.author.settings.update(UserSettings.FavoriteItems, {});
				return msg.channel.send(
					`You cleared your favorite items. Here is what you had in your favorite list: ${objectEntries(
						currentFavorites
					)
						.sort((a, b) => a[1] - b[1])
						.map(id => `${id[1]} ${getOSItem(id[0]).name}`)
						.join(', ')}`
				);
			}
			return msg.channel.send('You dont have anything on your favorites to clear.');
		}

		if (!items) {
			if (objectEntries(currentFavorites).length === 0) {
				return msg.channel.send('You have no favorited items.');
			}
			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(currentFavorites, `${msg.author.username} Favorites`, false, {}, msg.author);
			return msg.channel.send({
				files: [new MessageAttachment(image!, 'osbot.png')]
			});
		}

		// Prepare the item list first before parsing it
		const toRemove: string[] = [];
		items = items
			.split(',')
			.map(s => {
				let sSpace = s.trim().split(' ');
				if (sSpace.length === 0) return undefined;
				if (sSpace.length === 1) return `0 ${s}`;
				if (sSpace.length > 1) {
					if (isNaN(Number(sSpace[0]))) return `0 ${s}`;
					if (sSpace[0] === '-1') {
						delete sSpace[0];
						toRemove.push(sSpace.join(' '));
						return `0 ${sSpace.join(' ')}`;
					}
				}
				return s;
			})
			.filter(f => f)
			.join(',');

		const added: string[] = [];
		const updated: string[] = [];
		const removed: string[] = [];
		const listUniques: string[] = [];
		let maxIndex = 0;
		// Get max index used
		for (const mi of objectValues(currentFavorites)) if (mi > maxIndex) maxIndex = mi;
		maxIndex++;
		// Iterate over items param
		for (const i of parseStringBank(items)) {
			if (listUniques.includes(i[0].name)) continue;
			listUniques.push(i[0].name);
			let sortOrder = i[1] ?? currentFavorites[i[0].id] ?? 1;
			if (toRemove.find(r => stringMatches(r, `${i[0].id}`) || stringMatches(r, `${i[0].name}`))) {
				if (!currentFavorites[i[0].id]) continue;
				removed.push(i[0].name);
				delete currentFavorites[i[0].id];
			} else if (!currentFavorites[i[0].id] && sortOrder !== -1) {
				if (sortOrder === 0) {
					sortOrder = maxIndex;
					maxIndex++;
				}
				added.push(`${i[0].name} [${sortOrder}]`);
				currentFavorites[i[0].id] = sortOrder;
			} else if (currentFavorites[i[0].id] && sortOrder !== currentFavorites[i[0].id]) {
				if (sortOrder === 0) continue;
				updated.push(`${i[0].name} [${currentFavorites[i[0].id]} >> ${sortOrder}]`);
				currentFavorites[i[0].id] = sortOrder;
			}
		}
		await msg.author.settings.update(UserSettings.FavoriteItems, currentFavorites);

		let returnString = '';
		if (added.length > 0) returnString += `Added ${added.join(', ')}`;
		if (removed.length > 0) returnString += `${returnString ? '\n' : ''}Removed ${removed.join(', ')}`;
		if (updated.length > 0) returnString += `${returnString ? '\n' : ''}Updated ${updated.join(', ')}`;

		return msg.channel.send(returnString || 'Nothing was changed on your favorite list.');
	}
}
