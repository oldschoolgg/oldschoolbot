import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		const res = await this.client.orm.query(
			`SELECT "new_user".username, sum(xp) as total_xp
FROM xp_gains
INNER JOIN "new_users" "new_user" ON xp_gains.user_id = "new_user"."id"
WHERE date > ('2021-06-05 07:00:00'::timestamp)
AND date < ('2021-06-12 07:00:00'::timestamp)
AND skill = 'construction'
GROUP BY "new_user".username
ORDER BY total_xp DESC
LIMIT 15;`
		);

		if (res.length === 0) {
			return msg.channel.send(`No results found.`);
		}

		const embed = new MessageEmbed().setTitle(`#1 BSO SOTW - Construction`).setDescription(
			res
				.map((i: any, index: number) => {
					const pos = index + 1;
					let username = `${pos}. ${i.username ?? 'Unknown'}`;
					if (pos < 3) username = `**${username}**`;
					return ` ${username} ${Number(i.total_xp).toLocaleString()} XP`;
				})
				.join('\n')
		);

		return msg.send(embed);
	}
}
