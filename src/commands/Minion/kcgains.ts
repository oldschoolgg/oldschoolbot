import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { client } from '../../index';
import { PerkTier } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import LeaderboardCommand from './leaderboard';

const TimeIntervals = ['day', 'week'] as const;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Show's who has the highest KC gains for a given time period.",
			categoryFlags: ['minion', 'utility'],
			examples: ['+kcgains day fire giant', '+kcgains week nightmare'],
			aliases: ['log'],
			usage: '<day|week> <monster:...str>',
			usageDelim: ' ',
			perkTier: PerkTier.Four,
			cooldown: 30
		});
	}

	async run(msg: KlasaMessage, [interval, _monster]: [string, string]) {
		if (!TimeIntervals.includes(interval as any)) return;
		const monster = killableMonsters.find(
			k => stringMatches(k.name, _monster) || k.aliases.some(a => stringMatches(a, _monster))
		);
		if (!monster) {
			return msg.channel.send('Invalid monster.');
		}

		const query = `SELECT user_id AS user, SUM(("data"->>'quantity')::int) AS qty, MAX(finish_date) AS lastDate FROM activity
WHERE type = 'MonsterKilling' AND ("data"->>'monsterID')::int = ${monster.id}
AND finish_date >= current_date - interval '${interval === 'day' ? 1 : 7}' day AND completed = true
GROUP BY 1
ORDER BY qty DESC, lastDate ASC
LIMIT 10`;

		const res = await client.query<{ user_id: string; qty: number }[]>(query);

		if (res.length === 0) {
			return msg.channel.send('No results found.');
		}

		const command = this.client.commands.get('leaderboard') as LeaderboardCommand;

		let place = 0;
		const embed = new MessageEmbed()
			.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
			.setDescription(
				res
					.map(
						(i: any) =>
							`${++place}. **${command.getUsername(i.user, res.length)}**: ${Number(
								i.qty
							).toLocaleString()}`
					)
					.join('\n')
			);

		return msg.channel.send({ embeds: [embed] });
	}
}
