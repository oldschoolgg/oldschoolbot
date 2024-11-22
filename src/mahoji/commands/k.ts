import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType, type InteractionReplyOptions } from 'discord.js';

import type { PvMMethod } from '../../lib/constants';
import { NEX_ID, PVM_METHODS, ZALCANO_ID } from '../../lib/constants';
import killableMonsters, { wikiMonsters } from '../../lib/minions/data/killableMonsters';

import { Time, reduceNumByPercent } from 'e';
import { Eatables } from '../../lib/data/eatables';
import { calculateMonsterFood } from '../../lib/minions/functions';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { formatDuration, returnStringOrFile, stringMatches } from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import findMonster from '../../lib/util/findMonster';
import { minionKillCommand } from '../lib/abstracted_commands/minionKill/minionKill';
import type { OSBMahojiCommand } from '../lib/util';

export const autocompleteMonsters = [
	...killableMonsters,
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
		name: 'Nex',
		aliases: ['nex'],
		id: NEX_ID
	},
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		id: ZALCANO_ID,
		emoji: '<:Smolcano:604670895113633802>'
	},
	{
		name: 'Wintertodt',
		aliases: ['wt', 'wintertodt', 'todt'],
		id: -1,
		emoji: '<:Phoenix:324127378223792129>'
	},
	{
		name: 'Colosseum',
		aliases: ['colo', 'colosseum'],
		id: -1
	}
];

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

export const minionKCommand: OSBMahojiCommand = {
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
			type: ApplicationCommandOptionType.Integer,
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
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'wilderness',
			description: 'If you want to kill the monster in the wilderness.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'solo',
			description: 'Solo (if its a group boss)',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
		method?: PvMMethod;
		show_info?: boolean;
		wilderness?: boolean;
		solo?: boolean;
	}>) => {
		const user = await mUserFetch(userID);
		if (options.show_info) {
			return returnStringOrFile(await monsterInfo(user, options.name));
		}
		return minionKillCommand(
			user,
			interaction,
			channelID,
			options.name,
			options.quantity,
			options.method,
			options.wilderness,
			options.solo
		);
	}
};

export async function monsterInfo(user: MUser, name: string): Promise<string | InteractionReplyOptions> {
	const monster = findMonster(name);

	const prefix = 'https://wiki.oldschool.gg/osb';

	if (stringMatches(name, 'nex')) {
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/bosses/nex/>).\n`;
	}

	if (stringMatches(name, 'colosseum')) {
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/bosses/colosseum/>).\n`;
	}

	if (stringMatches(name, 'wintertodt')) {
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/activities/wintertodt/>).\n`;
	}

	if (stringMatches(name, 'tempoross')) {
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/skills/fishing/tempoross/>).\n`;
	}

	if (stringMatches(name, 'zalcano')) {
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/miscelleanous/zalcano/>).\n`;
	}

	if (stringMatches(name.split(' ').pop(), 'nightmare')) {
		const link = stringMatches(name.split(' ')[0], 'phosanis') ? 'phosanis-nightmare' : 'the-nightmare';
		return `View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/bosses/${link}/>).\n`;
	}

	if (!monster) {
		return "That's not a valid monster";
	}

	const str = [`**${monster.name}**\n`];

	if (wikiMonsters.includes(monster)) {
		str.push(
			`View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/monsters/#${monster.name.toLowerCase().replace(' ', '-')}>).\n`
		);
	}

	if (monster.name.includes('Revenant')) {
		str.push(
			'View information, item costs, boosts and requirements for ${name} on the [wiki](<${prefix}/bosses/wildy/#revenants>).\n'
		);
	}

	const userKc = await user.getKC(monster.id);
	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, userKc);

	let hpString = '';
	// Find best eatable boost and add 1% extra
	const noFoodBoost = Math.floor(Math.max(...Eatables.map(eatable => eatable.pvmBoost ?? 0)) + 1);
	if (monster.healAmountNeeded) {
		const [hpNeededPerKill] = calculateMonsterFood(monster, user);
		if (hpNeededPerKill === 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, noFoodBoost);
			hpString = `${noFoodBoost}% boost for no food`;
		}
	}
	const maxCanKillSlay = Math.floor(calcMaxTripLength(user, 'MonsterKilling') / reduceNumByPercent(timeToFinish, 15));
	const maxCanKill = Math.floor(calcMaxTripLength(user, 'MonsterKilling') / timeToFinish);

	const { QP } = user;

	str.push(`**Barrage/Burst**: ${monster.canBarrage ? 'Yes' : 'No'}`);
	str.push(
		`**Cannon**: ${monster.canCannon ? `Yes, ${monster.cannonMulti ? 'multi' : 'single'} combat area` : 'No'}\n`
	);

	if (monster.qpRequired) {
		str.push(`${monster.name} requires **${monster.qpRequired}qp** to kill, and you have ${QP}qp.\n`);
	}

	if (monster.healAmountNeeded) {
		const itemRequirements = [];
		const [hpNeededPerKill, gearStats] = calculateMonsterFood(monster, user);
		const gearReductions = gearStats.replace(/: Reduced from (?:[0-9]+?), /, '\n').replace('), ', ')\n');
		if (hpNeededPerKill > 0) {
			itemRequirements.push(
				`**Healing Required:** ${gearReductions}\nYou require ${
					hpNeededPerKill * maxCanKill
				} hp for a full trip.\n`
			);
		} else {
			itemRequirements.push(`**Healing Required:** ${gearReductions}\n**Food boost**: ${hpString}.\n`);
		}
		str.push(`${itemRequirements.join('')}`);
	}

	str.push('**Trip info**');

	str.push(
		`Maximum trip length: ${formatDuration(
			calcMaxTripLength(user, 'MonsterKilling')
		)}.\nNormal kill time: ${formatDuration(
			monster.timeToFinish
		)}. You can kill up to ${maxCanKill} per trip (${formatDuration(timeToFinish)} per kill).`
	);

	str.push(
		`If you were on a slayer task: ${maxCanKillSlay} per trip (${formatDuration(
			reduceNumByPercent(timeToFinish, 15)
		)} per kill).`
	);

	const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);

	str.push(
		`Every ${kcForOnePercent}kc you will gain a 1% (upto 10%).\nYou currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`
	);

	const min = timeToFinish * maxCanKill * 1.01;
	const max = timeToFinish * maxCanKill * 1.2;
	str.push(
		`Due to the random variation of an added 1-20% duration, ${maxCanKill}x kills can take between (${formatDuration(
			min
		)}) and (${formatDuration(max)})\nIf the Weekend boost is active, it takes: (${formatDuration(
			min * 0.9
		)}) to (${formatDuration(max * 0.9)}) to finish.\n`
	);
	const response: InteractionReplyOptions = {
		content: str.join('\n')
	};

	return response;
}
