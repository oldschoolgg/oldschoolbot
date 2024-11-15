import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Hiscores } from 'oldschooljs';
import type { SkillsScore } from 'oldschooljs/dist/meta/types';

import { statsEmbed } from '../../lib/util/statsEmbed';
import type { OSBMahojiCommand } from '../lib/util';

export const xpCommand: OSBMahojiCommand = {
	name: 'xp',
	description: 'See your OSRS xp.',
	attributes: {
		examples: ['/xp rsn:Magnaboy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rsn',
			description: 'The runescape username to check',
			required: true
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'to_99',
			description: 'Only show xp remaining until level 99.',
			required: false
		}
	],
	run: async ({ options }: CommandRunOptions<{ rsn: string; to_99?: boolean }>) => {
		const player = await Hiscores.fetch(options.rsn);

		if (options.to_99) {
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
			const embed = statsEmbed({
				username: options.rsn,
				color: 7_981_338,
				player,
				key: 'xp',
				showExtra: false
			});
			return { embeds: [embed] };
		}
		return {
			embeds: [statsEmbed({ username: options.rsn, color: 7_981_338, player, key: 'xp', showExtra: false })]
		};
	}
};
