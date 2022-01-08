import { User } from '@prisma/client';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

import { skillEmoji } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatTimestamp, toTitleCase } from '../../lib/util';

export const sotwConfig = {
	start: new Date('2022/1/10 15:00'),
	finish: new Date('2022/1/17 15:00'),
	skill: SkillsEnum.Runecraft,
	notes: ['1st age items do not contribute', 'Master capes do not work']
} as const;
const { start, finish, skill } = sotwConfig;

export const sotwIsActive = start.getTime() <= Date.now();

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		if (!sotwIsActive) {
			return msg.channel.send(
				`The SOTW starts in: ${formatTimestamp(start, true)}.

**Skill:** ${skillEmoji[skill]} ${toTitleCase(skill)}
**Start:** ${formatTimestamp(start)}
**Finish:** ${formatTimestamp(finish)}`
			);
		}

		const res: { id: User['id']; ironman: boolean; total_xp: number }[] = await prisma.$queryRawUnsafe(
			`SELECT sum(xp) as total_xp, u."minion.ironman" as ironman, u.id
FROM xp_gains
INNER JOIN "users" "u" ON (xp_gains.user_id)::text = "u"."id"
WHERE date > ('2022-01-5 07:00:00'::timestamp)
AND date < ('2021-07-12 07:00:00'::timestamp)
AND skill = '${sotwConfig.skill}'
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
