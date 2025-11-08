import { stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { type BossRecords, bossNameMap, Hiscores, mappedBossNames } from 'oldschooljs/hiscores';

export const kcCommand = defineCommand({
	name: 'kc',
	description: 'See your OSRS kc for a monster/boss.',
	attributes: {
		examples: ['/kc name:General Graardor']
	},
	options: [
		{
			type: 'String',
			name: 'rsn',
			description: 'The runescape username to check',
			required: true
		},
		{
			type: 'String',
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
	run: async ({ options }) => {
		const { player, error } = await Hiscores.fetch(options.rsn);
		if (error !== null) {
			return error;
		}
		for (const [boss, { rank, score }] of Object.entries(player.bossRecords)) {
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
	}
});
