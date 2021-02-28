import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import LeaderboardCommand from '../Minion/leaderboard';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four,
			usage: '<monsterName:str> <itemName:str>',
			oneAtTime: true,
			cooldown: 120,
			usageDelim: ',',
			description: 'Shows the highest drystreaks for an item from a monster.',
			examples: ['+drystreak corp, elysian sigil', '+drystreak cerb, pegasian crystal'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage, [monName, itemName]: [string, string]) {
		const mon = effectiveMonsters.find(mon =>
			mon.aliases.some(alias => stringMatches(alias, monName))
		);
		if (!mon) {
			return msg.send(`That's not a valid monster or minigame.`);
		}

		const item = getOSItem(itemName);

		const ironmanPart = msg.flagArgs.im ? 'AND "minion.ironman" = true' : '';
		const key = 'monsterScores';
		const { id } = mon;
		const query = `SELECT "id", "${key}"->>'${id}' AS "KC" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NULL AND "${key}"->>'${id}' IS NOT NULL ${ironmanPart} ORDER BY ("${key}"->>'${id}')::int DESC LIMIT 10;`;

		const result = await this.client.query<
			{
				id: string;
				KC: string;
			}[]
		>(query);

		if (result.length === 0) return msg.send(`No results found.`);

		const command = this.client.commands.get('leaderboard') as LeaderboardCommand;

		return msg.send(
			`**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
				.map(
					({ id, KC }) =>
						`${command.getUsername(id) as string}: ${parseInt(KC).toLocaleString()}`
				)
				.join('\n')}`
		);
	}
}
