import { type CommandRunOptions, stringMatches, toTitleCase } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { type BossRecords, Hiscores, bossNameMap, mappedBossNames } from 'oldschooljs';

import type { OSBMahojiCommand } from '../lib/util';

export const kcCommand: OSBMahojiCommand = {
	name: 'kc',
	description: 'See your OSRS kc for a monster/boss.',
	attributes: {
		examples: ['/kc name:General Graardor']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rsn',
			description: 'The runescape username to check',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'boss',
			description: 'The boss you want to check',
			required: true,
			autocomplete: async (value: string) => {
				return mappedBossNames
					.filter(i => (!value ? true : (i[0] + i[1]).toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: i[1], value: i[1] }));
			}
		}
	],
	run: async ({ options }: CommandRunOptions<{ rsn: string; boss: string }>) => {
		try {
			const { bossRecords } = await Hiscores.fetch(options.rsn);

			for (const [boss, { rank, score }] of Object.entries(bossRecords)) {
				if (stringMatches(boss, options.boss)) {
					if (score === -1 || rank === -1) {
						return `${toTitleCase(options.rsn)}'s has no recorded KC for that boss.`;
					}
					return `${toTitleCase(options.rsn)}'s ${bossNameMap.get(
						boss as keyof BossRecords
					)} KC is **${score.toLocaleString()}** (Rank ${rank.toLocaleString()})`;
				}
			}

			return `${toTitleCase(options.rsn)} doesn't have any recorded kills for that boss.`;
		} catch (err: any) {
			return err.message;
		}
	}
};
