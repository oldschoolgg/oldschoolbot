import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import fetch from 'node-fetch';
import { Hiscores } from 'oldschooljs';

import leaguesJson from '../../lib/leagues.json';
import { statsEmbed } from '../../lib/util/statsEmbed';
import type { OSBMahojiCommand } from '../lib/util';

interface LeaguesData {
	[key: string]: {
		id: number;
		title: string;
		points: number;
		completionPercentage: number | null;
	};
}

const leaguesData: LeaguesData = leaguesJson;

export const leaguesOSRSCommand: OSBMahojiCommand = {
	name: 'leagues',
	description: 'Check the stats of a OSRS account.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'username',
			description: 'The RuneScape username of the account.',
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ username: string }>) => {
		const leaguesResult: {
			username: string;
			league_tasks: number[];
		} = await fetch(
			`https://sync.runescape.wiki/runelite/player/${encodeURIComponent(
				options.username
			)}/TRAILBLAZER_RELOADED_LEAGUE`,
			{
				headers: {
					'User-Agent': 'Old School Bot - @magnaboy'
				}
			}
		)
			.then(res => res.json())
			.catch(() => null);
		if (!leaguesResult || 'error' in leaguesResult) {
			return 'Error fetching leagues stats. Are you using the WikiSync plugin?';
		}
		const player = await Hiscores.fetch(options.username, {
			type: 'seasonal'
		});

		const [rarestTaskCompleted] = leaguesResult.league_tasks.sort((a, b) => {
			return (leaguesData[a].completionPercentage ?? 0) - (leaguesData[b].completionPercentage ?? 0);
		});
		return {
			content: `You have completed ${leaguesResult.league_tasks.length} tasks.
You have ${leaguesResult.league_tasks.reduce((acc, cur) => acc + leaguesData[cur].points, 0)} points.
Your rarest task is **${leaguesData[rarestTaskCompleted].title}** with ${
				leaguesData[rarestTaskCompleted].completionPercentage ?? '<0.1'
			}% completion.
`,
			embeds: [
				statsEmbed({
					username: options.username,
					color: 7_981_338,
					player,
					postfix: '(Leagues)',
					key: 'level'
				})
			]
		};
	}
};
