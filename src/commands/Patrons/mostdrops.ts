import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { allClItems } from '../../lib/data/Collections';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import LeaderboardCommand from '../Minion/leaderboard';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four,
			usage: '<itemName:str>',
			oneAtTime: true,
			cooldown: 120,
			description: 'Shows which players have received the most drops of an item, based on their collection log.',
			examples: ['+mostdrops elysian sigil'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage, [itemName]: [string]) {
		const item = getOSItem(itemName);
		if (!allClItems.includes(item.id)) {
			return msg.channel.send("You can't check this item, because it's not on any collection log.");
		}

		const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

		const result = await this.client.query<
			{
				id: string;
				qty: string;
			}[]
		>(query);

		if (result.length === 0) return msg.channel.send('No results found.');

		const command = this.client.commands.get('leaderboard') as LeaderboardCommand;

		return msg.channel.send(
			`**Most '${item.name}' received:**\n${result
				.map(
					({ id, qty }) =>
						`${result.length < 10 ? '(Anonymous)' : command.getUsername(id)}: ${parseInt(
							qty
						).toLocaleString()}`
				)
				.join('\n')}`
		);
	}
}
