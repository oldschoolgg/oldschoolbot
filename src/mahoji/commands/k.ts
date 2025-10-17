import { PVM_METHODS } from '@/lib/constants.js';
import { choicesOf } from '@/lib/discord/index.js';
import { autocompleteMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { minionKillCommand } from '@/mahoji/lib/abstracted_commands/minionKill/minionKill.js';

async function fetchUsersRecentlyKilledMonsters(userID: string) {
	const res = await prisma.$queryRawUnsafe<{ mon_id: string; last_killed: Date }[]>(
		`SELECT DISTINCT((data->>'mi')) AS mon_id, MAX(start_date) as last_killed
FROM activity
WHERE user_id = $1
AND type = 'MonsterKilling'
AND finish_date > now() - INTERVAL '31 days'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10;`,
		BigInt(userID)
	);
	return res.map(i => Number(i.mon_id));
}

export const minionKCommand = defineCommand({
	name: 'k',
	description: 'Send your minion to kill things.',
	attributes: {
		requiresMinion: true,
		examples: ['/k name:zulrah']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to kill.',
			required: true,
			autocomplete: async (value: string, user: MUser) => {
				const recentlyKilled = await fetchUsersRecentlyKilledMonsters(user.id);
				return autocompleteMonsters
					.filter(m =>
						!value
							? true
							: [m.name.toLowerCase(), ...m.aliases].some(str => str.includes(value.toLowerCase()))
					)
					.sort((a, b) => {
						const hasA = recentlyKilled.includes(a.id);
						const hasB = recentlyKilled.includes(b.id);
						if (hasA && hasB) {
							return recentlyKilled.indexOf(a.id) < recentlyKilled.indexOf(b.id) ? -1 : 1;
						}
						if (hasA) return -1;
						if (hasB) return 1;
						return 0;
					})
					.map(i => ({
						name: `${i.name}${recentlyKilled.includes(i.id) ? ' (Recently killed)' : ''}`,
						value: i.name
					}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The amount you want to kill.',
			required: false,
			min_value: 0
		},
		{
			type: 'String',
			name: 'method',
			description: 'If you want to cannon/barrage/burst.',
			required: false,
			choices: choicesOf(PVM_METHODS)
		},
		{
			type: 'Boolean',
			name: 'wilderness',
			description: 'If you want to kill the monster in the wilderness.',
			required: false
		},
		{
			type: 'Boolean',
			name: 'solo',
			description: 'Solo (if its a group boss)',
			required: false
		}
	],
	run: async ({ options, user, channelID, interaction }) => {
		return minionKillCommand(
			user,
			interaction,
			channelID,
			options.name,
			options.quantity,
			options.method,
			options.wilderness,
			options.solo,
			undefined
		);
	}
});
