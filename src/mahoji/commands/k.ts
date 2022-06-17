import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { PVM_METHODS, PvMMethod } from '../../lib/constants';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { prisma } from '../../lib/settings/prisma';
import { minionKillCommand } from '../lib/abstracted_commands/minionKill';
import { OSBMahojiCommand } from '../lib/util';

const autocompleteMonsters = [
	...effectiveMonsters,
	{
		name: 'Tempoross',
		aliases: ['temp', 'tempoross']
	}
];

async function fetchUsersRecentlyKilledMonsters(userID: string) {
	const res = await prisma.$queryRawUnsafe<{ mon_id: string }[]>(
		`SELECT DISTINCT((data->>'monsterID')) AS mon_id
FROM activity
WHERE user_id = $1
AND type = 'MonsterKilling'
AND finish_date > now() - INTERVAL '31 days'
LIMIT 10;`,
		BigInt(userID)
	);
	return new Set(res.map(i => Number(i.mon_id)));
}

export const killCommand: OSBMahojiCommand = {
	name: 'k',
	description: 'Send your minion to kill things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Send your minion to kill things.',
		examples: ['/k zulrah']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to kill.',
			required: true,
			autocomplete: async (value, user) => {
				const recentlyKilled = await fetchUsersRecentlyKilledMonsters(user.id);
				return autocompleteMonsters
					.filter(m =>
						!value
							? true
							: [m.name.toLowerCase(), ...m.aliases].some(str => str.includes(value.toLowerCase()))
					)
					.sort((a, b) => {
						const hasA = recentlyKilled.has(a.id);
						const hasB = recentlyKilled.has(b.id);
						if (hasA && hasB) return 0;
						if (hasA) return -1;
						if (hasB) return 1;
						return 0;
					})
					.map(i => ({
						name: `${i.name}${recentlyKilled.has(i.id) ? ' (Recently killed)' : ''}`,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'quantity',
			description: 'The amount you want to kill.',
			required: false,
			min_value: 0
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'method',
			description: 'If you want to cannon/barrage/burst.',
			required: false,
			choices: PVM_METHODS.map(i => ({ name: i, value: i }))
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{ name: string; quantity?: number; method?: PvMMethod }>) => {
		const user = await globalClient.fetchUser(userID);
		return minionKillCommand(interaction, user, channelID, options.name, options.quantity, options.method);
	}
};
