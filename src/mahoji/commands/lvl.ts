import { ApplicationCommandOptionType } from 'discord.js';
import { convertLVLtoXP, convertXPtoLVL } from 'oldschooljs';
import { Hiscores } from 'oldschooljs/hiscores';

import { MAX_LEVEL, MAX_XP } from '@/lib/constants.js';
import { skillOption } from '@/lib/discord/index.js';
import type { SkillNameType } from '@/lib/skilling/types.js';

const xpLeft = (xp: number) => {
	const level = convertXPtoLVL(xp, MAX_LEVEL);
	if (level === 99) return 0;
	return (convertLVLtoXP(level + 1) - xp).toLocaleString();
};

export const lvlCommand: OSBMahojiCommand = {
	name: 'lvl',
	description: 'See a level in your OSRS stats.',
	attributes: {
		examples: ['/lvl rsn:Magnaboy skill:Mining']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rsn',
			description: 'The runescape username to check',
			required: true
		},
		{
			...skillOption,
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ rsn: string; skill: SkillNameType }>) => {
		try {
			const res = await Hiscores.fetch(options.rsn).then(player => player.skills[options.skill]);

			let str = `**${options.rsn}**'s ${options.skill} level is **${res.level}** and is`;

			if (res.level < 99) {
				str += ` **${xpLeft(res.xp)}** XP away from level **${res.level + 1}**.`;
			} else {
				str += ` **${(MAX_XP - res.xp).toLocaleString()}** XP away from **200m**.`;
			}

			return str;
		} catch (err: any) {
			return err.message;
		}
	}
};
