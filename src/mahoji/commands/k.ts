import { returnStringOrFile } from '@oldschoolgg/toolkit/discord-util';
import { type CommandRunOptions, formatDuration } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType, type InteractionReplyOptions } from 'discord.js';
import { Time, reduceNumByPercent } from 'e';

import { formatList } from '@/lib/util/smallUtils';
import { Quests } from 'oldschooljs';
import { Eatables } from '../../lib/data/eatables';
import { autocompleteMonsters, wikiMonsters } from '../../lib/minions/data/killableMonsters';
import { calculateMonsterFood } from '../../lib/minions/functions';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import findMonster from '../../lib/util/findMonster';
import { minionKillCommand } from '../lib/abstracted_commands/minionKill/minionKill';
import type { OSBMahojiCommand } from '../lib/util';

export const PVM_METHODS = ['barrage', 'cannon', 'burst', 'chinning', 'none'] as const;
export type PvMMethod = (typeof PVM_METHODS)[number];

const wikiPrefix = 'https://wiki.oldschool.gg/osb';

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
		onTask?: boolean;
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
			options.solo,
			options.onTask
		);
	}
};

async function monsterInfo(user: MUser, name: string): Promise<string | InteractionReplyOptions> {
	const otherMon = autocompleteMonsters.find(m => m.name === name || m.aliases.includes(name));
	if (otherMon && 'link' in otherMon) {
		return `View information, item costs, boosts and requirements for ${otherMon.name} on the [wiki](<${wikiPrefix}${otherMon.link}>).\n`;
	}

	const monster = findMonster(name);
	if (!monster) {
		return "That's not a valid monster";
	}

	const str = [`**${monster.name}**\n`];

	if (wikiMonsters.includes(monster)) {
		str.push(
			`View information, item costs, boosts and requirements for ${monster.name} on the [wiki](<${wikiPrefix}/monsters/#${monster.name.toLowerCase().replace(/\s/g, '-')}>).\n`
		);
	}

	if (monster.name.includes('Revenant')) {
		str.push(
			`View information, item costs, boosts and requirements for ${monster.name} on the [wiki](<${wikiPrefix}/bosses/wildy/#revenants>).\n`
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

	str.push(`**Barrage/Burst**: ${monster.canBarrage ? 'Yes' : 'No'}`);
	str.push(
		`**Cannon**: ${monster.canCannon ? `Yes, ${monster.cannonMulti ? 'multi' : 'single'} combat area` : 'No'}\n`
	);

	if (monster.requiredQuests && monster.requiredQuests.length > 0) {
		const questNames = formatList(
			monster.requiredQuests.map(qID => {
				const quest = Quests.find(q => q.id === qID);
				return quest ? quest.name : `Quest ID ${qID}`;
			})
		);
		str.push(`**Required Quests:** ${questNames}`);
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
