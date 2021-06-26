import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { SkillsScore } from 'oldschooljs/dist/meta/types';
import { convertLVLtoXP, convertXPtoLVL } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/structures/BotCommand';

const xpLeft = (xp: number) => {
	const level = convertXPtoLVL(xp);
	if (level === 99) return 0;
	return (convertLVLtoXP(level + 1) - xp).toLocaleString();
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows the level of a single stat, and the XP remaining.',
			usage:
				'<attack|defence|strength|hitpoints|ranged|prayer|' +
				'magic|cooking|woodcutting|fletching|fishing|firemaking|' +
				'crafting|smithing|mining|herblore|agility|thieving|slayer|' +
				'farming|runecraft|hunter|construction> (username:...rsn)',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+lvl attack Woox', '+lvl strength'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [skill, username]: [keyof SkillsScore, string]) {
		try {
			const res = await Hiscores.fetch(username).then(player => player.skills[skill]);

			let str = `**${username}**'s ${skill} level is **${res.level}** and is`;

			if (res.level < 99) {
				str += ` **${xpLeft(res.xp)}** XP away from level **${res.level + 1}**.`;
			} else {
				str += ` **${(200000000 - res.xp).toLocaleString()}** XP away from **200m**.`;
			}

			return msg.send(str);
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
