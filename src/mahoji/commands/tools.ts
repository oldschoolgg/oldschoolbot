import { Embed } from '@discordjs/builders';
import { Activity, User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { CoXUniqueTable } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';
import { ToBUniqueTable } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';

import {
	allStashUnitsFlat,
	getParsedStashUnits,
	stashUnitBuildAllCommand,
	stashUnitFillAllCommand,
	stashUnitUnfillCommand,
	stashUnitViewCommand
} from '../../lib/clues/stashUnits';
import { BitField, PerkTier } from '../../lib/constants';
import { allCLItemsFiltered, allDroppedItems } from '../../lib/data/Collections';
import { anglerOutfit, gnomeRestaurantCL } from '../../lib/data/CollectionsExport';
import pets from '../../lib/data/pets';
import killableMonsters, { effectiveMonsters, NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { MUser } from '../../lib/MUser';
import { MinigameName, Minigames } from '../../lib/settings/minigames';
import { convertStoredActivityToFlatActivity, prisma } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import {
	asyncGzip,
	formatDuration,
	getUsername,
	isGroupActivity,
	isNexActivity,
	isRaidsActivity,
	isTobActivity,
	itemNameFromID,
	stringMatches
} from '../../lib/util';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { dataPoints, statsCommand } from '../lib/abstracted_commands/statCommand';
import { itemOption, monsterOption, skillOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, mUserFetch, patronMsg } from '../mahojiSettings';

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
		attachments: [{ fileName: 'activity-export.txt.gz', buffer: zipped }]
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

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
		.setDescription(
			res
				.map((i: any) => `${++place}. **${getUsername(i.user)}**: ${Number(i.total_xp).toLocaleString()} XP`)
				.join('\n')
		);

	return { embeds: [embed] };
}

async function kcGains(user: MUser, interval: string, monsterName: string): CommandResponse {
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

	const res = await prisma.$queryRawUnsafe<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
		.setDescription(
			res.map((i: any) => `${++place}. **${getUsername(i.user)}**: ${Number(i.qty).toLocaleString()}`).join('\n')
		);

	return { embeds: [embed] };
}

interface DrystreakMinigame {
	name: string;
	key: MinigameName;
	items: number[];
}

const dryStreakMinigames: DrystreakMinigame[] = [
	{
		name: 'Theatre of Blood (ToB)',
		key: 'tob',
		items: ToBUniqueTable.allItems
	},
	{
		name: 'Fishing Trawler',
		key: 'fishing_trawler',
		items: anglerOutfit
	},
	{
		name: 'Gnome Restaurant',
		key: 'gnome_restaurant',
		items: gnomeRestaurantCL
	},
	{
		name: 'Gauntlet',
		key: 'gauntlet',
		items: resolveItems(['Crystal weapon seed', 'Crystal armour seed', 'Enhanced crystal weapon seed', 'Youngllef'])
	},
	{
		name: 'Inferno',
		key: 'inferno',
		items: resolveItems(['Jal-nib-rek'])
	},
	{
		name: 'Wintertodt',
		key: 'wintertodt',
		items: resolveItems(['Tome of fire', 'Phoenix', 'Bruma torch', 'Warm gloves'])
	}
];

interface DrystreakEntity {
	name: string;
	items: number[];
	run: (args: { item: Item; ironmanOnly: boolean }) => Promise<{ id: string; val: number }[]>;
	format: (num: number) => string;
}
const dryStreakEntities: DrystreakEntity[] = [
	{
		name: 'Chambers of Xeric (CoX)',
		items: CoXUniqueTable.allItems,
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT id, total_cox_points AS val
FROM users
WHERE "collectionLogBank"->>'${item.id}' IS NULL
${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
ORDER BY total_cox_points DESC
LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} points`
	},
	{
		name: 'Nightmare',
		items: resolveItems([
			"Inquisitor's mace",
			"Inquisitor's great helm",
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Nightmare staff',
			'Eldritch orb',
			'Volatile orb',
			'Harmonised orb'
		]),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT "id", ("monsterScores"->>'${NightmareMonster.id}')::int AS val
				   FROM users
				   WHERE "collectionLogBank"->>'${item.id}' IS NULL
				   AND "monsterScores"->>'${NightmareMonster.id}' IS NOT NULL 
				   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''} 
				   ORDER BY ("monsterScores"->>'${NightmareMonster.id}')::int DESC
				   LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} KC`
	},
	{
		name: 'Barbarian Assault (Pet penance queen)',
		items: resolveItems(['Pet penance queen']),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT "id", high_gambles AS val
				   FROM users
				   WHERE "collectionLogBank"->>'${item.id}' IS NULL
				   AND high_gambles > 0
				   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''} 
				   ORDER BY high_gambles DESC
				   LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Gambles`
	}
];
for (const minigame of dryStreakMinigames) {
	dryStreakEntities.push({
		name: minigame.name,
		items: minigame.items,
		run: async ({ item, ironmanOnly }) => {
			const minigameObj = Minigames.find(i => i.column === minigame.key)!;
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT users.id, "minigame"."${
				minigameObj.column
			}" AS val
FROM users
INNER JOIN "minigames" "minigame" on "minigame"."user_id" = "users"."id"::text
WHERE "collectionLogBank"->>'${item.id}' IS NULL
${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
ORDER BY "minigame"."${minigameObj.column}" DESC
LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} KC`
	});
}

async function dryStreakCommand(user: MUser, monsterName: string, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);

	const item = getOSItem(itemName);

	const entity = dryStreakEntities.find(i => stringMatches(i.name, monsterName));
	if (entity) {
		if (!entity.items.includes(item.id)) {
			return `That's not a valid item dropped for this thing, valid items are: ${entity.items
				.map(itemNameFromID)
				.join(', ')}.`;
		}

		const result = await entity.run({ item, ironmanOnly });
		if (result.length === 0) return 'No results found.';

		return `**Dry Streaks for ${item.name} from ${entity.name}:**\n${result
			.map(({ id, val }) => `${getUsername(id)}: ${entity.format(val || -1)}`)
			.join('\n')}`;
	}

	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monsterName)));
	if (!mon) {
		return "That's not a valid monster or minigame.";
	}

	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	const key = 'monsterScores';
	const { id } = mon;
	const query = `SELECT "id", "${key}"->>'${id}' AS "KC" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NULL AND "${key}"->>'${id}' IS NOT NULL ${ironmanPart} ORDER BY ("${key}"->>'${id}')::int DESC LIMIT 10;`;

	const result = await prisma.$queryRawUnsafe<
		{
			id: string;
			KC: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
		.map(({ id, KC }) => `${getUsername(id) as string}: ${parseInt(KC).toLocaleString()}`)
		.join('\n')}`;
}

async function mostDrops(user: MUser, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const item = getItem(itemName);
	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	if (!item) return "That's not a valid item.";
	if (!allDroppedItems.includes(item.id) && !user.bitfield.includes(BitField.isModerator)) {
		return "You can't check this item, because it's not on any collection log.";
	}

	const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ${ironmanPart} ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

	const result = await prisma.$queryRawUnsafe<
		{
			id: string;
			qty: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	return `**Most '${item.name}' received:**\n${result
		.map(
			({ id, qty }) =>
				`${result.length < 10 ? '(Anonymous)' : getUsername(id)}: ${parseInt(qty).toLocaleString()}`
		)
		.join('\n')}`;
}

async function checkMassesCommand(guildID: bigint | undefined) {
	if (!guildID) return 'This can only be used in a server.';
	const guild = globalClient.guilds.cache.get(guildID.toString());
	if (!guild) return 'Guild not found.';
	const channelIDs = guild.channels.cache.filter(c => c.type === 'text').map(c => BigInt(c.id));

	const masses = (
		await prisma.activity.findMany({
			where: {
				completed: false,
				group_activity: true,
				channel_id: { in: channelIDs }
			},
			orderBy: {
				finish_date: 'asc'
			}
		})
	)
		.map(convertStoredActivityToFlatActivity)
		.filter(m => (isRaidsActivity(m) || isGroupActivity(m) || isTobActivity(m)) && m.users.length > 1);

	if (masses.length === 0) {
		return 'There are no active masses in this server.';
	}
	const now = Date.now();
	const massStr = masses
		.map(m => {
			const remainingTime =
				isTobActivity(m) || isNexActivity(m)
					? m.finishDate - m.duration + m.fakeDuration - now
					: m.finishDate - now;
			if (isGroupActivity(m)) {
				return [
					remainingTime,
					`${m.type}${isRaidsActivity(m) && m.challengeMode ? ' CM' : ''}: ${
						m.users.length
					} users returning to <#${m.channelID}> in ${formatDuration(remainingTime)}`
				];
			}
		})
		.sort((a, b) => (a![0] < b![0] ? -1 : a![0] > b![0] ? 1 : 0))
		.map(m => m![1])
		.join('\n');
	return `**Masses in this server:**
${massStr}`;
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
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster',
							description: 'The monster you want to pick.',
							required: true,
							autocomplete: async value => {
								return [
									...dryStreakEntities.map(i => ({ name: i.name, value: i })),
									...killableMonsters
								]
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							...itemOption(item => allCLItemsFiltered.includes(item.id)),
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
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check various stats.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'stat',
							description: 'The stat you want to check',
							autocomplete: async (value: string) => {
								return dataPoints
									.map(i => i.name)
									.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({
										name: i,
										value: i
									}));
							},
							required: true
						}
					]
				}
			]
		},
		{
			name: 'user',
			description: 'Various tools for yourself.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'mypets',
					description: 'See the chat pets you have.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'temp_cl',
					description: 'Manage and view your temporary CL.',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset your temporary CL.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'checkmasses',
					description: 'Check the masses going on in the server.'
				}
			]
		},
		{
			name: 'stash_units',
			description: 'Build and fill your treasure trails S.T.A.S.H units.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'view',
					description: 'View your STASH units.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'unit',
							description: 'The specific unit you want to view (optional).',
							required: false,
							autocomplete: async (value: string) => {
								return allStashUnitsFlat
									.filter(i => (!value ? true : i.desc.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.desc, value: i.id }));
							}
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'not_filled',
							description: 'View all STASH units that you have not filled/built.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'build_all',
					description: 'Automatically build all the STASH units that you can.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'fill_all',
					description: 'Automatically fill all the STASH units that you can.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unfill',
					description: 'Remove the items from a specific stash.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'unit',
							description: 'The specific unit you want to unfill.',
							required: true,
							autocomplete: async (value, user) => {
								return (await getParsedStashUnits(user.id))
									.filter(i => i.builtUnit !== undefined && i.builtUnit.items_contained.length > 0)
									.filter(i =>
										!value ? true : i.unit.desc.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.unit.desc, value: i.unit.id }));
							}
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction,
		guildID
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
			stats?: { stat: string };
		};
		user?: { mypets?: {}; temp_cl: { reset?: boolean }; checkmasses?: {} };
		stash_units?: {
			view?: { unit?: string; not_filled?: boolean };
			build_all?: {};
			fill_all?: {};
			unfill?: { unit: string };
		};
	}>) => {
		interaction.deferReply();
		const mahojiUser = await mUserFetch(userID);

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
					bank: new Bank(mahojiUser.user.sacrificedBank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const clBank = mahojiUser.cl;
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
				interaction.deferReply();
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				return minionStats(mahojiUser.user);
			}
			if (patron.activity_export) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				const promise = activityExport(mahojiUser.user);
				await handleMahojiConfirmation(
					interaction,
					'I will send a file containing ALL of your activities, intended for advanced users who want to use the data. Anyone in this channel will be able to see and download the file, are you sure you want to do this?'
				);
				const result = await promise;
				return result;
			}
			if (patron.stats) {
				return statsCommand(mahojiUser, patron.stats.stat);
			}
		}
		if (options.user) {
			if (options.user.mypets) {
				let b = new Bank();
				for (const [pet, qty] of Object.entries(mahojiUser.user.pets as ItemBank)) {
					const petObj = pets.find(i => i.id === Number(pet));
					if (!petObj) continue;
					b.add(petObj.name, qty);
				}
				return {
					attachments: [
						(await makeBankImage({ bank: b, title: `Your Chat Pets (${b.length}/${pets.length})` })).file
					]
				};
			}
		}
		const klasaUser = await mUserFetch(mahojiUser.id);

		if (options.stash_units) {
			if (options.stash_units.view) {
				return stashUnitViewCommand(
					mahojiUser.user,
					options.stash_units.view.unit,
					options.stash_units.view.not_filled
				);
			}
			if (options.stash_units.build_all) return stashUnitBuildAllCommand(klasaUser);
			if (options.stash_units.fill_all) return stashUnitFillAllCommand(klasaUser, mahojiUser.user);
			if (options.stash_units.unfill) {
				return stashUnitUnfillCommand(klasaUser, options.stash_units.unfill.unit);
			}
		}
		if (options.user?.temp_cl) {
			if (options.user.temp_cl === true) {
				await handleMahojiConfirmation(interaction, 'Are you sure you want to reset your temporary CL?');
				await mahojiUserSettingsUpdate(klasaUser.id, {
					temp_cl: {},
					last_temp_cl_reset: new Date()
				});
				return 'Reset your temporary CL.';
			}
			const lastReset = await prisma.user.findUnique({
				where: {
					id: klasaUser.id
				},
				select: {
					last_temp_cl_reset: true
				}
			});
			return `You can view your temporary CL using, for example, \`/cl name:PvM type:Temp\`.
You last reset your temporary CL: ${
				Boolean(lastReset?.last_temp_cl_reset)
					? `<t:${Math.floor((lastReset?.last_temp_cl_reset?.getTime() ?? 1) / 1000)}>`
					: 'Never'
			}`;
		}
		if (options.user?.checkmasses) {
			return checkMassesCommand(guildID);
		}
		return 'Invalid command!';
	}
};
