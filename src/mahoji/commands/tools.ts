import { Embed } from '@discordjs/builders';
import { Activity, User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import LeaderboardCommand from '../../commands/Minion/leaderboard';
import { BitField, PerkTier } from '../../lib/constants';
import { allDroppedItems } from '../../lib/data/Collections';
import killableMonsters, { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { prisma } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import { asyncGzip, formatDuration, stringMatches } from '../../lib/util';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { itemOption, monsterOption, skillOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch, patronMsg } from '../mahojiSettings';

const TimeIntervals = ['day', 'week'] as const;
const skillsVals = Object.values(Skills);

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

const whereInMassClause = (id: string) =>
	`OR (group_activity = true AND data::jsonb ? 'users' AND data->>'users'::text LIKE '%${id}%')`;

async function activityExport(user: User): CommandResponse {
	const allActivities = await prisma.$queryRawUnsafe<
		Activity[]
	>(`SELECT floor(date_part('epoch', start_date)) AS start_date, floor(date_part('epoch', finish_date)) AS finish_date, duration, type, data
FROM activity
WHERE user_id = '${user.id}'
OR (group_activity = true AND data::jsonb ? 'users' AND data->>'users'::text LIKE '%${user.id}%');`);
	let res = ['Start', 'Finish', 'Duration', 'Type', 'Data'].join('\t');
	for (const { start_date, finish_date, duration, type, data } of allActivities) {
		res += `\n${start_date}\t${finish_date}\t${duration}\t${type}\t${JSON.stringify(data)}`;
	}
	const buffer = Buffer.from(res, 'utf-8');
	const zipped = await asyncGzip(buffer);

	return {
		attachments: [{ fileName: 'activity-export.gz', buffer: zipped }]
	};
}

async function minionStats(user: User) {
	const { id } = user;
	const [[totalActivities], [firstActivity], countsPerActivity, [_totalDuration]] = (await Promise.all([
		prisma.$queryRawUnsafe(`SELECT count(id)
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)};`),
		prisma.$queryRawUnsafe(`SELECT id, start_date, type
FROM activity
WHERE user_id = ${id}
ORDER BY id ASC
LIMIT 1;`),
		prisma.$queryRawUnsafe(`
SELECT type, count(type) as qty
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)}
GROUP BY type
ORDER BY qty DESC
LIMIT 15;`),
		prisma.$queryRawUnsafe(`
SELECT sum(duration)
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)};`)
	])) as any[];

	const totalDuration = Number(_totalDuration.sum);
	const firstActivityDate = new Date(firstActivity.start_date);

	const diff = dateDiff(firstActivityDate.getTime(), Date.now());
	const perDay = totalDuration / diff;

	return `**Total Activities:** ${totalActivities.count}
**Common Activities:** ${countsPerActivity
		.slice(0, 3)
		.map((i: any) => `${i.qty}x ${i.type}`)
		.join(', ')}
**Total Minion Activity:** ${formatDuration(totalDuration)}
**First Activity:** ${firstActivity.type} ${firstActivityDate.toLocaleDateString('en-CA')}
**Average Per Day:** ${formatDuration(perDay)}
`;
}

async function xpGains(interval: string, skill?: string) {
	if (!TimeIntervals.includes(interval as any)) return 'Invalid time.';
	const skillObj = skill
		? skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, skill)))
		: undefined;

	const res: any =
		await prisma.$queryRawUnsafe(`SELECT user_id::text AS user, sum(xp) AS total_xp, max(date) AS lastDate
FROM xp_gains
WHERE date > now() - INTERVAL '1 ${interval.toLowerCase() === 'day' ? 'day' : 'week'}'
${skillObj ? `AND skill = '${skillObj.id}'` : ''}
GROUP BY user_id
ORDER BY total_xp DESC, lastDate ASC
LIMIT 10;`);

	if (res.length === 0) {
		return 'No results found.';
	}

	const command = globalClient.commands.get('leaderboard') as LeaderboardCommand;

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
		.setDescription(
			res
				.map(
					(i: any) =>
						`${++place}. **${command.getUsername(i.user)}**: ${Number(i.total_xp).toLocaleString()} XP`
				)
				.join('\n')
		);

	return { embeds: [embed] };
}

async function kcGains(user: User, interval: string, monsterName: string): CommandResponse {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	if (!TimeIntervals.includes(interval as any)) return 'Invalid time interval.';
	const monster = killableMonsters.find(
		k => stringMatches(k.name, monsterName) || k.aliases.some(a => stringMatches(a, monsterName))
	);
	if (!monster) {
		return 'Invalid monster.';
	}

	const query = `SELECT user_id AS user, SUM(("data"->>'quantity')::int) AS qty, MAX(finish_date) AS lastDate FROM activity
WHERE type = 'MonsterKilling' AND ("data"->>'monsterID')::int = ${monster.id}
AND finish_date >= now() - interval '${interval === 'day' ? 1 : 7}' day AND completed = true
GROUP BY 1
ORDER BY qty DESC, lastDate ASC
LIMIT 10`;

	const res = await globalClient.query<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	const command = globalClient.commands.get('leaderboard') as LeaderboardCommand;

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
		.setDescription(
			res
				.map(
					(i: any) =>
						`${++place}. **${command.getUsername(i.user, res.length)}**: ${Number(i.qty).toLocaleString()}`
				)
				.join('\n')
		);

	return { embeds: [embed] };
}

async function dryStreakCommand(user: User, monsterName: string, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monsterName)));
	if (!mon) {
		return "That's not a valid monster or minigame.";
	}

	const item = getOSItem(itemName);

	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	const key = 'monsterScores';
	const { id } = mon;
	const query = `SELECT "id", "${key}"->>'${id}' AS "KC" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NULL AND "${key}"->>'${id}' IS NOT NULL ${ironmanPart} ORDER BY ("${key}"->>'${id}')::int DESC LIMIT 10;`;

	const result = await globalClient.query<
		{
			id: string;
			KC: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	const command = globalClient.commands.get('leaderboard') as LeaderboardCommand;

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
		.map(({ id, KC }) => `${command.getUsername(id) as string}: ${parseInt(KC).toLocaleString()}`)
		.join('\n')}`;
}

async function mostDrops(user: User, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const item = getItem(itemName);
	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	if (!item) return "That's not a valid item.";
	if (!allDroppedItems.includes(item.id) && !user.bitfield.includes(BitField.isModerator)) {
		return "You can't check this item, because it's not on any collection log.";
	}

	const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ${ironmanPart} ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

	const result = await globalClient.query<
		{
			id: string;
			qty: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	const command = globalClient.commands.get('leaderboard') as LeaderboardCommand;

	return `**Most '${item.name}' received:**\n${result
		.map(
			({ id, qty }) =>
				`${result.length < 10 ? '(Anonymous)' : command.getUsername(id)}: ${parseInt(qty).toLocaleString()}`
		)
		.join('\n')}`;
}

export const toolsCommand: OSBMahojiCommand = {
	name: 'tools',
	description: 'Various tools and miscellaneous commands.',
	options: [
		{
			name: 'patron',
			description: 'Tools that only patrons can use.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'kc_gains',
					description: "Show's who has the highest KC gains for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week'].map(i => ({ name: i, value: i }))
						},
						monsterOption
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp_gains',
					description: "Show's who has the highest XP gains for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week'].map(i => ({ name: i, value: i }))
						},
						skillOption
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'drystreak',
					description: "Show's the biggest drystreaks for certain drops from a certain monster.",
					options: [
						monsterOption,
						{
							...itemOption(),
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'mostdrops',
					description:
						"Show's which players have received the most drops of an item, based on their collection log.",
					options: [
						{
							...itemOption(),
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'sacrificed_bank',
					description: 'Shows an image containing all your sacrificed items.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'cl_bank',
					description: 'Shows a bank image containing all items in your collection log.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'format',
							description: 'Bank Image or Json format?',
							required: false,
							choices: ['bank', 'json'].map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'minion_stats',
					description: 'Shows statistics about your minion.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'activity_export',
					description: 'Export all your activities (For advanced users).'
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		patron?: {
			kc_gains?: {
				time: 'day' | 'week';
				monster: string;
			};
			xp_gains?: {
				time: 'day' | 'week';
				skill?: string;
			};
			drystreak?: {
				monster: string;
				item: string;
				ironman?: boolean;
			};
			mostdrops?: {
				item: string;
				ironman?: boolean;
			};
			sacrificed_bank?: {};
			cl_bank?: {
				format?: 'bank' | 'json';
			};
			minion_stats?: {};
			activity_export?: {};
		};
	}>) => {
		interaction.deferReply();
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		if (options.patron) {
			const { patron } = options;
			if (patron.kc_gains) {
				return kcGains(mahojiUser, patron.kc_gains.time, patron.kc_gains.monster);
			}
			if (patron.drystreak) {
				return dryStreakCommand(
					mahojiUser,
					patron.drystreak.monster,
					patron.drystreak.item,
					Boolean(patron.drystreak.ironman)
				);
			}
			if (patron.mostdrops) {
				return mostDrops(mahojiUser, patron.mostdrops.item, Boolean(patron.mostdrops.ironman));
			}
			if (patron.sacrificed_bank) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const image = await makeBankImage({
					bank: new Bank(mahojiUser.sacrificedBank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (getUsersPerkTier(mahojiUser.bitfield) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const clBank = new Bank(mahojiUser.collectionLogBank as ItemBank);
				if (patron.cl_bank.format === 'json') {
					const json = JSON.stringify(clBank);
					return {
						attachments: [{ buffer: Buffer.from(json), fileName: 'clbank.json' }]
					};
				}
				const image = await makeBankImage({
					bank: clBank,
					title: 'Your Entire Collection Log'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.xp_gains) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				return xpGains(patron.xp_gains.time, patron.xp_gains.skill);
			}
			if (patron.minion_stats) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				return minionStats(mahojiUser);
			}
			if (patron.activity_export) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				const promise = activityExport(mahojiUser);
				await handleMahojiConfirmation(
					interaction,
					'I will send a file containing ALL of your activities, intended for advanced users who want to use the data. Anyone in this channel will be able to see and download the file, are you sure you want to do this?'
				);
				const result = await promise;
				return result;
			}
		}
		return 'Invalid command!';
	}
};
