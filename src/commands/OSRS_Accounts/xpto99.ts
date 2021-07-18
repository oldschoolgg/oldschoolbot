import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { SkillsScore } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows how much XP you have left until 99 in all skills.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			categoryFlags: ['utility'],
			examples: ['+xpto99 Magnaboy']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);

			let totalXP = 0;
			for (const skill of Object.keys(player.skills) as (keyof SkillsScore)[]) {
				const { xp } = player.skills[skill];
				if (!xp) continue;
				if (skill !== 'overall') {
					const clampedXP = Math.min(xp, 13_034_431);
					const remainingXP = 13_034_431 - clampedXP;
					totalXP += clampedXP;
					player.skills[skill].xp = remainingXP;
				}
			}

			player.skills.overall.xp = 299_791_913 - totalXP;
			const embed = this.getStatsEmbed(username, 7_981_338, player, 'xp', false);
			return msg.channel.send({ embeds: [embed] });
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
