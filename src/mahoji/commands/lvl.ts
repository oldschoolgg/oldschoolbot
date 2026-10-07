import { convertLVLtoXP, convertXPtoLVL } from 'oldschooljs';
import { Hiscores } from 'oldschooljs/hiscores';

import { skillOption } from '@/discord/index.js';
import { MAX_LEVEL, MAX_XP } from '@/lib/constants.js';

const xpLeft = (xp: number) => {
	const level = convertXPtoLVL(xp, MAX_LEVEL);
	if (level === 99) return 0;
	return (convertLVLtoXP(level + 1) - xp).toLocaleString();
};

export const lvlCommand = defineCommand({
	name: 'lvl',
	description: 'See a level in your OSRS stats.',
	attributes: {
		examples: ['/lvl rsn:Magnaboy skill:Mining']
	},
	options: [
		{
			type: 'String',
			name: 'rsn',
			description: 'The runescape username to check',
			required: true
		},
		{
			...skillOption,
			required: true
		}
	],
	run: async ({ options }) => {
		const { player, error } = await Hiscores.fetch(options.rsn);
		if (error !== null) {
			return error;
		}

		if (options.skill === 'sailing') {
			return 'Sailing is not available on OSRS hiscores yet.';
		}

		const res = player.skills[options.skill as keyof typeof player.skills];
		let str = `**${options.rsn}**'s ${options.skill} level is **${res.level}** and is`;

		if (res.level < 99) {
			str += ` **${xpLeft(res.xp)}** XP away from level **${res.level + 1}**.`;
		} else {
			str += ` **${(MAX_XP - res.xp).toLocaleString()}** XP away from **200m**.`;
		}

		return str;
	}
});
