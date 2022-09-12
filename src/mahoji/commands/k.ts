import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { PVM_METHODS, PvMMethod, ZALCANO_ID } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { Ignecarus } from '../../lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../../lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../../lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { MOKTANG_ID } from '../../lib/minions/data/killableMonsters/custom/bosses/Moktang';
import { Naxxus } from '../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { VasaMagus } from '../../lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { revenantMonsters } from '../../lib/minions/data/killableMonsters/revs';
import { NexMonster } from '../../lib/nex';
import { prisma } from '../../lib/settings/prisma';
import { minionKillCommand, monsterInfo } from '../lib/abstracted_commands/minionKill';
import { OSBMahojiCommand } from '../lib/util';

const autocompleteMonsters = [
	...killableMonsters,
	...revenantMonsters,
	{
		id: -1,
		name: 'Tempoross',
		aliases: ['temp', 'tempoross']
	},
	...["Phosani's Nightmare", 'Mass Nightmare', 'Solo Nightmare'].map(s => ({
		id: -1,
		name: s,
		aliases: [s.toLowerCase()]
	})),
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		id: ZALCANO_ID,
		emoji: '<:Smolcano:604670895113633802>'
	},
	VasaMagus,
	{
		...Ignecarus,
		name: 'Ignecarus (Solo)'
	},
	{
		...Ignecarus,
		name: 'Ignecarus (Mass)'
	},
	{
		...KingGoldemar,
		name: 'King Goldemar (Solo)'
	},
	{
		...KingGoldemar,
		name: 'King Goldemar (Mass)'
	},
	{
		...NexMonster,
		name: 'Nex (Solo)'
	},
	{
		...NexMonster,
		name: 'Nex (Mass)'
	},
	{
		...KalphiteKingMonster,
		name: 'Kalphite King (Solo)'
	},
	{
		...KalphiteKingMonster,
		name: 'Kalphite King (Mass)'
	},
	{
		...Naxxus,
		name: 'Naxxus'
	},
	{
		name: 'Wintertodt',
		aliases: ['wt', 'wintertodt', 'todt'],
		id: -1,
		emoji: '<:Phoenix:324127378223792129>'
	},
	{
		name: 'Moktang',
		aliases: ['moktang'],
		id: MOKTANG_ID
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
		examples: ['/k name:zulrah']
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
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'show_info',
			description: 'Show information on this monster.',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{ name: string; quantity?: number; method?: PvMMethod; show_info?: boolean }>) => {
		const user = await globalClient.fetchUser(userID);
		if (options.show_info) return monsterInfo(user, options.name);
		return minionKillCommand(interaction, user, channelID, options.name, options.quantity, options.method);
	}
};
