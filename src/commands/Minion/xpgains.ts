import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { Skills } from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import LeaderboardCommand from './leaderboard';

const TimeIntervals = ['day', 'week'] as const;

const skillsVals = Object.values(Skills);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Show's who has the highest XP gains for a given time period.",
			categoryFlags: ['minion', 'utility'],
			examples: ['+xpgains day smithing', '+xpgains week'],
			aliases: ['log'],
			usage: '<day|week> [skill:str]',
			usageDelim: ' ',
			perkTier: PerkTier.Four
		});
	}

	async run(msg: KlasaMessage, [interval, skill]: [string, string | null]) {
		if (!TimeIntervals.includes(interval as any)) return;
		const skillObj = skill
			? skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, skill)))
			: undefined;

		const res: any =
			await prisma.$queryRawUnsafe(`SELECT user_id::text AS user, sum(xp) AS total_xp, max(date) AS lastDate
FROM xp_gains
WHERE date > now() - INTERVAL '1 ${interval.toLowerCase() === 'day' ? 'day' : 'week'}'
${skillObj ? `AND skill = '${skillObj.id}'` : ''}
GROUP BY user_id
ORDER BY total_xp DESC, lastDate ASC
LIMIT 10;`);

		if (res.length === 0) {
			return msg.channel.send('No results found.');
		}

		const command = this.client.commands.get('leaderboard') as LeaderboardCommand;

		let place = 0;
		const embed = new MessageEmbed()
			.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
			.setDescription(
				res
					.map(
						(i: any) =>
							`${++place}. **${command.getUsername(i.user)}**: ${Number(i.total_xp).toLocaleString()} XP`
					)
					.join('\n')
			);

		return msg.channel.send({ embeds: [embed] });
	}
}
