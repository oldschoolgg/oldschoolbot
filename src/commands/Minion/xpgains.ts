import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { Skills } from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const TimeIntervals = ['day', 'week'] as const;

const skillsVals = Object.values(Skills);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Show's who has the highest XP gains for a given time period.",
			categoryFlags: ['minion', 'utility'],
			examples: ['+xpgains day smithing', `+xpgains week`],
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

		const res = await this.client.orm.query(
			`SELECT "new_user".username, sum(xp) as total_xp
FROM xp_gains
INNER JOIN "new_users" "new_user" ON xp_gains.user_id = "new_user"."id"
WHERE date > now() - INTERVAL '1 ${interval}'
${skillObj ? `AND skill = '${skillObj.id}'` : ''}
GROUP BY "new_user".username
ORDER BY total_xp DESC
LIMIT 10;`
		);

		if (res.length === 0) {
			return msg.channel.send(`No results found.`);
		}

		const embed = new MessageEmbed()
			.setTitle(
				`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`
			)
			.setDescription(
				res
					.map(
						(i: any) =>
							`**${i.username ?? 'Unknown'}** ${Number(
								i.total_xp
							).toLocaleString()} XP`
					)
					.join('\n')
			);

		return msg.send(embed);
	}
}
