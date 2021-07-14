import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		const res = await this.client.orm.query(
			`SELECT sum(xp) as total_xp, u."minion.ironman" as ironman, u.id
FROM xp_gains
INNER JOIN "users" "u" ON xp_gains.user_id = "u"."id"
WHERE date > ('2021-07-10 07:00:00'::timestamp)
AND date < ('2021-07-17 07:00:00'::timestamp)
AND skill = 'runecraft'
${msg.flagArgs.im ? 'AND u."minion.ironman" = true' : ''}
GROUP BY "u".id
ORDER BY total_xp DESC
LIMIT 15;`
		);

		if (res.length === 0) {
			return msg.channel.send('No results found.');
		}

		const embed = new MessageEmbed().setTitle('#1 SOTW - Runecraft').setDescription(
			res
				.map((i: any, index: number) => {
					const pos = index + 1;
					// @ts-ignore 2339
					let username = `${pos}. ${this.client.commands.get('leaderboard')!.getUsername(i.id)}`;
					if (pos < 3) username = `**${username}**`;
					return ` ${username} ${Number(i.total_xp).toLocaleString()} XP`;
				})
				.join('\n')
		);

		return msg.channel.send({ embeds: [embed] });
	}
}
