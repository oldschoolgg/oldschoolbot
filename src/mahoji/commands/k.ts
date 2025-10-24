import { PVM_METHODS } from '@/lib/constants.js';
import { choicesOf } from '@/lib/discord/index.js';
import { autocompleteMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { minionKillCommand } from '@/mahoji/lib/abstracted_commands/minionKill/minionKill.js';

async function fetchUsersRecentlyKilledMonsters(userID: string): Promise<number[]> {
	const res = await prisma.userStats.findUnique({
		where: {
			user_id: BigInt(userID)
		},
		select: {
			recently_killed_monsters: true
		}
	});
	if (!res) return [];
	return res.recently_killed_monsters;
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
			// @ts-expect-error: Passed by the bot only
			options.onTask
		);
	}
});
