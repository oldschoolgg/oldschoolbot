/* eslint-disable @typescript-eslint/no-floating-promises */
import { EmbedBuilder } from '@discordjs/builders';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { Prisma } from '@prisma/client';
import { ChatInputCommandInteraction } from 'discord.js';
import { calcWhatPercent, chunk, objectValues, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { badges, badgesCache, Emoji, masteryKey, usernameCache } from '../../lib/constants';
import { allClNames, allCollectionLogsFlat, getCollectionItems } from '../../lib/data/Collections';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { allOpenables } from '../../lib/openables';
import { Minigames } from '../../lib/settings/minigames';
import { prisma } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	channelIsSendable,
	convertXPtoLVL,
	formatDuration,
	getUsername,
	makePaginatedMessage,
	stringMatches,
	stripEmojis
} from '../../lib/util';
import { fetchCLLeaderboard } from '../../lib/util/clLeaderboard';
import { deferInteraction } from '../../lib/util/interactionReply';
import { userEventsToMap } from '../../lib/util/userEvents';
import { sendToChannelID } from '../../lib/util/webhook';
import { OSBMahojiCommand } from '../lib/util';

const LB_PAGE_SIZE = 10;

function lbMsg(str: string, ironmanOnly?: boolean) {
	return {
		content: `Showing you the ${str} leaderboard, click the buttons to change pages.${
			ironmanOnly ? ' Showing only ironmen.' : ''
		}`,
		ephemeral: true
	};
}

export function getPos(page: number, record: number) {
	return `${page * LB_PAGE_SIZE + 1 + record}. `;
}

export async function doMenu(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	pages: string[],
	title: string
) {
	if (pages.length === 0) {
		return sendToChannelID(interaction.channelId, { content: 'There are no users on this leaderboard.' });
	}
	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	makePaginatedMessage(
		channel,
		pages.map(p => ({ embeds: [new EmbedBuilder().setTitle(title).setDescription(p)] })),
		user.id
	);
}

async function kcLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	name: string,
	ironmanOnly: boolean
) {
	const monster = effectiveMonsters.find(mon => [mon.name, ...mon.aliases].some(alias => stringMatches(alias, name)));
	if (!monster) return "That's not a valid monster!";
	let list = await prisma.$queryRawUnsafe<{ id: string; kc: number }[]>(
		`SELECT user_id::text AS id, CAST("monster_scores"->>'${monster.id}' AS INTEGER) as kc
		 FROM user_stats
		${ironmanOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
		 WHERE CAST("monster_scores"->>'${monster.id}' AS INTEGER) > 5
		 ${ironmanOnly ? ' AND "users"."minion.ironman" = true ' : ''}
		 ORDER BY kc DESC
		 LIMIT 2000;`
	);

	doMenu(
		interaction,
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((user, j) => `${getPos(i, j)}**${getUsername(user.id)}:** ${user.kc.toLocaleString()}`)
				.join('\n')
		),
		`KC Leaderboard for ${monster.name}`
	);

	return lbMsg(`${monster.name} KC `, ironmanOnly);
}

async function farmingContractLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	ironmanOnly: boolean
) {
	let list = await prisma.$queryRawUnsafe<{ id: string; count: number }[]>(
		`SELECT id, CAST("minion.farmingContract"->>'contractsCompleted' AS INTEGER) as count
		 FROM users
		 WHERE "minion.farmingContract" is not null and CAST ("minion.farmingContract"->>'contractsCompleted' AS INTEGER) >= 1
		 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
		 ORDER BY count DESC
		 LIMIT 2000;`
	);

	doMenu(
		interaction,
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => {
					return `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`;
				})
				.join('\n')
		),
		'Farming Contracts Leaderboard'
	);
	return lbMsg('Farming Contract');
}

async function infernoLb() {
	const res = await prisma.$queryRawUnsafe<{ user_id: string; duration: number }[]>(`SELECT user_id, duration
FROM activity
WHERE type = 'Inferno'
AND data->>'deathTime' IS NULL
AND completed = true
ORDER BY duration ASC
LIMIT 10;`);

	if (res.length === 0) {
		return 'No results.';
	}

	return `**Inferno Records**\n\n${res
		.map((e, i) => `${i + 1}. **${getUsername(e.user_id)}:** ${formatDuration(e.duration)}`)
		.join('\n')}`;
}

async function sacrificeLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	type: 'value' | 'unique',
	ironmanOnly: boolean
) {
	if (type === 'value') {
		const list = (
			await prisma.$queryRawUnsafe<{ id: string; amount: number }[]>(
				`SELECT "id", "sacrificedValue"
					   FROM users
					   WHERE "sacrificedValue" > 0
					   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
					   ORDER BY "sacrificedValue"
					   DESC LIMIT 2000;`
			)
		).map((res: any) => ({ ...res, amount: parseInt(res.sacrificedValue) }));

		doMenu(
			interaction,
			user,
			channelID,
			chunk(list, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(({ id, amount }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${amount.toLocaleString()} GP `)
					.join('\n')
			),
			'Sacrifice Leaderboard'
		);

		return lbMsg('Most Value Sacrificed');
	}

	const mostUniques: { id: string; sacbanklength: number }[] = await prisma.$queryRawUnsafe(
		`SELECT u.user_id::text AS id, u.sacbanklength
				FROM (
  					SELECT (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS(sacrificed_bank)) sacbanklength, user_id FROM user_stats
  						${ironmanOnly ? 'INNER JOIN users ON users.id::bigint = user_stats.user_id WHERE "minion.ironman" = true' : ''}
				) u
				ORDER BY u.sacbanklength DESC LIMIT 10;
`
	);
	doMenu(
		interaction,
		user,
		channelID,
		chunk(mostUniques, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, sacbanklength }, j) =>
						`${getPos(i, j)}**${getUsername(id)}:** ${sacbanklength.toLocaleString()} Unique Sac's`
				)
				.join('\n')
		),
		'Unique Sacrifice Leaderboard'
	);
	return lbMsg('Unique Sacrifice');
}

async function minigamesLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string, name: string) {
	const minigame = Minigames.find(m => stringMatches(m.name, name) || m.aliases.some(a => stringMatches(a, name)));
	if (!minigame) {
		return `That's not a valid minigame. Valid minigames are: ${Minigames.map(m => m.name).join(', ')}.`;
	}

	if (minigame.name === 'Tithe farm') {
		const titheCompletions = await prisma.$queryRawUnsafe<{ id: string; amount: number }[]>(
			`SELECT user_id::text as id, tithe_farms_completed::int as amount
					   FROM user_stats
					   WHERE "tithe_farms_completed" > 10
					   ORDER BY "tithe_farms_completed"
					   DESC LIMIT 10;`
		);
		doMenu(
			interaction,
			user,
			channelID,
			chunk(titheCompletions, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(({ id, amount }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${amount.toLocaleString()}`)
					.join('\n')
			),
			'Tithe farm Leaderboard'
		);
		return lbMsg(`${minigame.name} Leaderboard`);
	}
	const res = await prisma.minigame.findMany({
		where: {
			[minigame.column]: {
				gt: minigame.column === 'champions_challenge' ? 1 : 10
			}
		},
		orderBy: {
			[minigame.column]: 'desc'
		},
		take: 10
	});

	doMenu(
		interaction,
		user,
		channelID,
		chunk(res, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((u, j) => `${getPos(i, j)}**${getUsername(u.user_id)}:** ${u[minigame.column].toLocaleString()}`)
				.join('\n')
		),
		`${minigame.name} Leaderboard`
	);
	return lbMsg(`${minigame.name} Leaderboard`);
}

async function clLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	inputType: string,
	ironmenOnly: boolean
) {
	const items = getCollectionItems(inputType, false);
	if (!items || items.length === 0) {
		return "That's not a valid collection log category. Check +cl for all possible logs.";
	}

	const clName = allCollectionLogsFlat.find(c => stringMatches(c.name, inputType))?.name;
	const userEventOrders = clName
		? await prisma.userEvent.findMany({
				where: {
					type: 'CLCompletion',
					collection_log_name: clName.toLowerCase()
				},
				orderBy: {
					date: 'asc'
				}
		  })
		: null;

	const users = await fetchCLLeaderboard({ ironmenOnly, items, resultLimit: 200, userEvents: userEventOrders });
	inputType = toTitleCase(inputType.toLowerCase());
	doMenu(
		interaction,
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, qty }, j) =>
						`${getPos(i, j)}**${getUsername(id)}:** ${qty.toLocaleString()} (${calcWhatPercent(
							qty,
							items.length
						).toFixed(1)}%)`
				)
				.join('\n')
		),
		`${inputType} Collection Log Leaderboard (${items.length} slots)`
	);
	return lbMsg(`${inputType} Collection Log Leaderboard`, ironmenOnly);
}

async function creaturesLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	creatureName: string
) {
	const creature = Hunter.Creatures.find(creature =>
		creature.aliases.some(
			alias => stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
		)
	);

	if (!creature) return 'Thats not a valid creature.';

	const query = `SELECT user_id::text as id, ("creature_scores"->>'${creature.id}')::int as count
				   FROM user_stats WHERE "creature_scores"->>'${creature.id}' IS NOT NULL
				   ORDER BY count DESC LIMIT 50;`;
	const data: { id: string; count: number }[] = await prisma.$queryRawUnsafe(query);
	doMenu(
		interaction,
		user,
		channelID,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`Catch Leaderboard for ${creature.name}`
	);
	return lbMsg(`${creature.name} Catch Leaderboard`);
}

async function lapsLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string, courseName: string) {
	const course = Agility.Courses.find(course => course.aliases.some(alias => stringMatches(alias, courseName)));

	if (!course) return 'Thats not a valid agility course.';

	const data: { id: string; count: number }[] = await prisma.$queryRawUnsafe(
		`SELECT user_id::text as id, ("laps_scores"->>'${course.id}')::int as count
			 FROM user_stats
			 WHERE "laps_scores"->>'${course.id}' IS NOT NULL
			 ORDER BY count DESC LIMIT 50;`
	);
	doMenu(
		interaction,
		user,
		channelID,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`${course.name} Laps Leaderboard`
	);
	return lbMsg(`${course.name} Laps`);
}

async function openLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	name: string,
	ironmanOnly: boolean
) {
	name = name.trim();

	let entityID = -1;
	let key = '';
	let openableName = '';

	const openable = !name
		? undefined
		: allOpenables.find(
				item => stringMatches(item.name, name) || item.name.toLowerCase().includes(name.toLowerCase())
		  );
	if (openable) {
		entityID = openable.id;
		key = 'openable_scores';
		openableName = openable.name;
	}

	if (entityID === -1) {
		return `That's not a valid openable item! You can check: ${allOpenables.map(i => i.name).join(', ')}.`;
	}

	let list = await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
		`SELECT user_id::text AS id, ("${key}"->>'${entityID}')::int as qty FROM user_stats
			${ironmanOnly ? 'INNER JOIN users ON users.id::bigint = user_stats.user_id' : ''}
			WHERE ("${key}"->>'${entityID}')::int > 3
			${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
			ORDER BY qty DESC LIMIT 30;`
	);

	doMenu(
		interaction,
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((user, j) => `${getPos(i, j)}**${getUsername(user.id)}:** ${user.qty.toLocaleString()}`)
				.join('\n')
		),
		`Open Leaderboard for ${openableName}`
	);
	return lbMsg(`${openableName} Opening`);
}

async function gpLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string, ironmanOnly: boolean) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; GP: number }[]>(
			`SELECT "id", "GP"
					   FROM users
					   WHERE "GP" > 1000000
					   ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY "GP" DESC
					   LIMIT 500;`
		)
	).map(res => ({ ...res, GP: Number(res.GP) }));

	doMenu(
		interaction,
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, GP }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${GP.toLocaleString()} GP`)
				.join('\n')
		),
		'GP Leaderboard'
	);
	return lbMsg('GP Leaderboard', ironmanOnly);
}

async function skillsLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	inputSkill: string,
	type: 'xp' | 'level',
	ironmanOnly: boolean
) {
	let res = [];
	let overallUsers: Record<string, any>[] = [];

	const skillsVals = Object.values(Skills);

	const skill = skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, inputSkill)));

	if (inputSkill === 'overall') {
		const events = await prisma.userEvent.findMany({
			where: {
				type: 'MaxTotalLevel'
			},
			orderBy: {
				date: 'asc'
			}
		});
		const userEventMap = userEventsToMap(events);
		const query = `SELECT
								u.id,
								${skillsVals.map(s => `"skills.${s.id}"`)},
								${skillsVals.map(s => `"skills.${s.id}"::int8`).join(' + ')} as totalxp,
								u."minion.ironman"
							FROM
								users u
							${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY totalxp DESC
							LIMIT 2000;`;
		res = await prisma.$queryRawUnsafe<Record<string, any>[]>(query);
		overallUsers = res.map(user => {
			let totalLevel = 0;
			for (const skill of skillsVals) {
				totalLevel += convertXPtoLVL(Number(user[`skills.${skill.id}`]) as any);
			}
			return {
				id: user.id,
				totalLevel,
				ironman: user['minion.ironman'],
				totalXP: Number(user.totalxp!)
			};
		});
		if (type !== 'xp') {
			overallUsers.sort((a, b) => {
				const valueDifference = b.totalLevel - a.totalLevel;
				if (valueDifference !== 0) {
					return valueDifference;
				}
				const dateA = userEventMap.get(a.id);
				const dateB = userEventMap.get(b.id);
				if (dateA && dateB) {
					return dateA - dateB;
				}
				if (dateA) {
					return -1;
				}
				if (dateB) {
					return 1;
				}
				return 0;
			});
		}
		overallUsers.slice(0, 100);
	} else {
		if (!skill) return "That's not a valid skill.";

		const query = `SELECT
								u."skills.${skill.id}", u.id, u."minion.ironman"
							FROM
								users u
							${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY
								1 DESC
							LIMIT 2000;`;
		res = await prisma.$queryRawUnsafe<Record<string, any>[]>(query);

		const events = await prisma.userEvent.findMany({
			where: {
				type: 'MaxLevel',
				skill: skill.id
			},
			orderBy: {
				date: 'asc'
			}
		});
		const userEventMap = userEventsToMap(events);
		res.sort((a, b) => {
			const aXP = Number(a[`skills.${skill.id}`]);
			const bXP = Number(b[`skills.${skill.id}`]);
			const valueDifference = bXP - aXP;
			if (valueDifference !== 0) {
				return valueDifference;
			}
			const dateA = userEventMap.get(a.id);
			const dateB = userEventMap.get(b.id);
			if (dateA && dateB) {
				return dateA - dateB;
			}
			if (dateA) {
				return -1;
			}
			if (dateB) {
				return 1;
			}
			return 0;
		});
	}

	if (inputSkill === 'overall') {
		doMenu(
			interaction,
			user,
			channelID,
			chunk(overallUsers, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map((obj, j) => {
						return `${getPos(i, j)}**${getUsername(
							obj.id
						)}:** ${obj.totalLevel.toLocaleString()} (${obj.totalXP.toLocaleString()} XP)`;
					})
					.join('\n')
			),
			`Overall ${type} Leaderboard`
		);
		return lbMsg(`Overall ${type}`);
	}

	doMenu(
		interaction,
		user,
		channelID,
		chunk(res, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((obj, j) => {
					const objKey = `skills.${skill?.id}`;
					const skillXP = Number(obj[objKey] ?? 0);

					return `${getPos(i, j)}**${getUsername(obj.id)}:** ${skillXP.toLocaleString()} XP (${convertXPtoLVL(
						skillXP
					)})`;
				})
				.join('\n')
		),
		`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
	);
	return lbMsg(`Overall ${skill!.name} ${type}`);
}

async function cluesLb(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	channelID: string,
	clueTierName: string,
	ironmanOnly: boolean
) {
	const clueTier = ClueTiers.find(i => stringMatches(i.name, clueTierName));
	if (!clueTier) return "That's not a valid clue tier.";
	const { id } = clueTier;
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT id, ("collectionLogBank"->>'${id}')::int AS score
FROM users
WHERE "collectionLogBank"->>'${id}' IS NOT NULL
AND ("collectionLogBank"->>'${id}')::int > 25
${ironmanOnly ? 'AND "minion.ironman" = true ' : ''}
ORDER BY ("collectionLogBank"->>'${id}')::int DESC
LIMIT 50;`
		)
	).map(res => ({ ...res, score: Number(res.score) }));

	doMenu(
		interaction,
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, score }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${score.toLocaleString()} Completed`)
				.join('\n')
		),
		`${clueTier.name} Clue Leaderboard`
	);
	return lbMsg('Clue Leaderboard', ironmanOnly);
}

export async function cacheUsernames() {
	const roboChimpUseresToCache = await roboChimpClient.user.findMany({
		where: {
			OR: [
				{
					osb_cl_percent: {
						gte: 80
					}
				},
				{
					bso_total_level: {
						gte: 80
					}
				},
				{
					osb_total_level: {
						gte: 1500
					}
				},
				{
					bso_total_level: {
						gte: 1500
					}
				},
				{
					leagues_points_total: {
						gte: 20_000
					}
				}
			]
		},
		select: {
			id: true
		}
	});

	let orConditions: Prisma.UserWhereInput[] = [];
	for (const skill of objectValues(SkillsEnum)) {
		orConditions.push({
			[`skills_${skill}`]: {
				gte: 15_000_000
			}
		});
	}
	const usersToCache = await prisma.user.findMany({
		where: {
			OR: [
				...orConditions,
				{
					last_command_date: {
						gt: new Date(Date.now() - Number(Time.Month))
					}
				}
			],
			id: {
				notIn: roboChimpUseresToCache.map(i => i.id.toString())
			}
		},
		select: {
			id: true
		}
	});

	const userIDsToCache = [...usersToCache, ...roboChimpUseresToCache].map(i => i.id.toString());
	debugLog(`Caching usernames of ${userIDsToCache.length} users`);

	const allNewUsers = await prisma.newUser.findMany({
		where: {
			username: {
				not: null
			},
			id: {
				in: userIDsToCache
			}
		},
		select: {
			id: true,
			username: true
		}
	});

	const arrayOfIronmenAndBadges: { badges: number[]; id: string; ironman: boolean }[] = await prisma.$queryRawUnsafe(
		'SELECT "badges", "id", "minion.ironman" as "ironman" FROM users WHERE ARRAY_LENGTH(badges, 1) > 0 OR "minion.ironman" = true;'
	);

	for (const user of allNewUsers) {
		const badgeUser = arrayOfIronmenAndBadges.find(i => i.id === user.id);
		const name = stripEmojis(user.username!);
		usernameCache.set(user.id, name);
		if (badgeUser) {
			const rawBadges = badgeUser.badges.map(num => badges[num]);
			if (badgeUser.ironman) {
				rawBadges.push(Emoji.Ironman);
			}
			badgesCache.set(user.id, rawBadges.join(' '));
		}
	}
}

const globalLbTypes = ['xp', 'cl', 'mastery'] as const;
type GlobalLbType = (typeof globalLbTypes)[number];
async function globalLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string, type: GlobalLbType) {
	if (type === 'xp') {
		const result = await roboChimpClient.$queryRaw<
			{
				id: string;
				osb_total_xp: number;
				bso_total_xp: number;
				osb_xp_percent: number;
				bso_xp_percent: number;
				average_percentage: number;
			}[]
		>`SELECT id::text, osb_total_xp, bso_total_xp,
       (osb_total_xp / (200000000.0 * 23) * 100) as osb_xp_percent,
       (bso_total_xp / (5000000000.0 * 25) * 100) as bso_xp_percent,
       (((osb_total_xp / (200000000.0 * 23) * 100) + (bso_total_xp / (5000000000.0 * 25) * 100)) / 2) as average_percentage
FROM public.user
WHERE osb_total_xp IS NOT NULL AND bso_total_xp IS NOT NULL
ORDER BY average_percentage DESC
LIMIT 10;
`;
		doMenu(
			interaction,
			user,
			channelID,
			chunk(result, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(
						({ id, osb_xp_percent, bso_xp_percent }, j) =>
							`${getPos(i, j)}**${getUsername(id)}:** ${osb_xp_percent.toFixed(
								2
							)}% OSB, ${bso_xp_percent.toFixed(2)}% BSO`
					)
					.join('\n')
			),
			'Global (OSB+BSO) XP Leaderboard (% of the max XP)'
		);
		return lbMsg('Global (OSB+BSO) XP Leaderboard');
	}

	if (type === 'mastery') {
		const result = await roboChimpClient.$queryRaw<
			{
				id: string;
				avg: number;
			}[]
		>`SELECT id::text, ((osb_mastery + bso_mastery) / 2) AS avg
FROM public.user
WHERE osb_mastery IS NOT NULL AND bso_mastery IS NOT NULL
ORDER BY avg DESC
LIMIT 10;
`;
		doMenu(
			interaction,
			user,
			channelID,
			chunk(result, LB_PAGE_SIZE).map((subList, i) =>
				subList.map(({ id, avg }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${avg.toFixed(2)}%`).join('\n')
			),
			'Global (OSB+BSO) Mastery Leaderboard'
		);
		return lbMsg('Global Mastery Leaderboard');
	}

	const result = await roboChimpClient.$queryRaw<
		{ id: string; total_cl_percent: number }[]
	>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
FROM public.user
WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
ORDER BY total_cl_percent DESC
LIMIT 20;`;

	doMenu(
		interaction,
		user,
		channelID,
		chunk(result, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, total_cl_percent }, j) =>
						`${getPos(i, j)}**${getUsername(id)}:** ${total_cl_percent.toLocaleString()}%`
				)
				.join('\n')
		),
		'Global (OSB+BSO) CL Leaderboard'
	);
	return lbMsg('Global (OSB+BSO) CL Leaderboard');
}

const gainersTypes = ['overall', 'top_250'] as const;
type GainersType = (typeof gainersTypes)[number];
async function gainersLB(interaction: ChatInputCommandInteraction, user: MUser, channelID: string, type: GainersType) {
	const result = await prisma.$queryRawUnsafe<
		{
			user_id: string;
			cl_global_rank: number;
			cl_completion_percentage: number;
			cl_completion_count: number;
			count_increase: number;
			rank_difference: number;
			percentage_difference: number;
		}[]
	>(
		type === 'overall'
			? `WITH latest_count AS (
  SELECT user_id, cl_global_rank, cl_completion_percentage, cl_completion_count, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) AS date_row
  FROM historical_data
	WHERE cl_global_rank != 0
),
seven_days_ago_count AS (
  SELECT user_id, cl_global_rank, cl_completion_percentage, cl_completion_count, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) AS date_row
  FROM historical_data
  WHERE date >= (CURRENT_DATE - INTERVAL '7 days') AND date < (CURRENT_DATE - INTERVAL '6 days')
	 AND cl_global_rank != 0
)
SELECT lc.user_id::text,
       lc.cl_global_rank,
       lc.cl_completion_percentage,
       lc.cl_completion_count,
       (lc.cl_completion_count - sdac.cl_completion_count) AS count_increase,
       (lc.cl_global_rank - sdac.cl_global_rank) AS rank_difference,
       (lc.cl_completion_percentage - sdac.cl_completion_percentage) AS percentage_difference
FROM latest_count lc
JOIN seven_days_ago_count sdac ON lc.user_id = sdac.user_id AND lc.date_row = 1 AND sdac.date_row = 1
ORDER BY count_increase DESC
LIMIT 10;`
			: `WITH latest_count AS (
  SELECT user_id, cl_global_rank, cl_completion_percentage, cl_completion_count, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) AS date_row
  FROM historical_data
	WHERE cl_global_rank <= 250
),
seven_days_ago_count AS (
  SELECT user_id, cl_global_rank, cl_completion_percentage, cl_completion_count, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) AS date_row
  FROM historical_data
  WHERE date >= (CURRENT_DATE - INTERVAL '7 days') AND date < (CURRENT_DATE - INTERVAL '6 days')
	AND  cl_global_rank <= 250
)
SELECT CAST(lc.user_id AS TEXT) AS user_id,
       lc.cl_global_rank,
       lc.cl_completion_percentage,
       lc.cl_completion_count,
       (lc.cl_completion_count - sdac.cl_completion_count) AS count_increase,
       (lc.cl_global_rank - sdac.cl_global_rank) AS rank_difference,
       (lc.cl_completion_percentage - sdac.cl_completion_percentage) AS percentage_difference,
       ((lc.cl_completion_count - sdac.cl_completion_count) * (1 + 0.1 * lc.cl_completion_count)) / (1 + ABS(lc.cl_global_rank - sdac.cl_global_rank)) AS score
FROM latest_count lc
JOIN seven_days_ago_count sdac ON lc.user_id = sdac.user_id AND lc.date_row = 1 AND sdac.date_row = 1
ORDER BY score DESC
LIMIT 10;
`
	);

	doMenu(
		interaction,
		user,
		channelID,
		chunk(result, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ user_id, cl_completion_count, cl_global_rank, count_increase, rank_difference }, j) =>
						`${getPos(i, j)}**${getUsername(
							user_id
						)}:** Gained ${count_increase} CL slots, from ${cl_completion_count} to ${
							cl_completion_count + count_increase
						}, and their global rank went from ${cl_global_rank - rank_difference} to ${cl_global_rank}`
				)
				.join('\n')
		),
		'Weekly Movers Leaderboard'
	);
	return lbMsg('Weekly Movers Leaderboard');
}

async function caLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
			`SELECT id, CARDINALITY(completed_ca_task_ids) AS qty
FROM users
WHERE CARDINALITY(completed_ca_task_ids) > 0
ORDER BY CARDINALITY(completed_ca_task_ids) DESC
LIMIT 50;`
		)
	).map(res => ({ ...res, score: Number(res.qty) }));

	doMenu(
		interaction,
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, qty }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${qty.toLocaleString()} Tasks Completed`
				)
				.join('\n')
		),
		'Combat Achievements Leaderboard'
	);
	return lbMsg('Combat Achievements Leaderboard');
}

async function masteryLb(interaction: ChatInputCommandInteraction, user: MUser, channelID: string) {
	const users = await roboChimpClient.user.findMany({
		where: {
			[masteryKey]: { not: null }
		},
		orderBy: {
			[masteryKey]: 'desc'
		},
		take: 50,
		select: {
			id: true,
			osb_mastery: true,
			bso_mastery: true
		}
	});

	doMenu(
		interaction,
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					(lUser, j) =>
						`${getPos(i, j)}**${getUsername(lUser.id)}:** ${lUser[masteryKey]!.toFixed(3)}% mastery`
				)
				.join('\n')
		),
		'Mastery Leaderboard'
	);
	return lbMsg('Mastery Leaderboard');
}

const ironmanOnlyOption = {
	type: ApplicationCommandOptionType.Boolean,
	name: 'ironmen_only',
	description: 'Only include ironmen.',
	required: false
} as const;

export const leaderboardCommand: OSBMahojiCommand = {
	name: 'lb',
	description: 'Simulate killing monsters.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'kc',
			description: 'Check the kc leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'monster',
					description: 'The monster you want to check the leaderboard of.',
					required: true,
					autocomplete: async value => {
						return effectiveMonsters
							.filter(m => (!value ? true : m.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'farming_contracts',
			description: 'Check the farming contracts leaderboard.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'inferno',
			description: 'Check the inferno leaderboard.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sacrifice',
			description: 'Check the sacrifice leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The particular sacrifice leaderboard you want to check.',
					required: true,
					choices: [
						{ name: 'Most Value Sacrificed', value: 'value' },
						{ name: 'Unique Items Sacrificed', value: 'unique' }
					]
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'minigames',
			description: 'Check the minigames leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'minigame',
					description: 'The particular minigame leaderboard you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Minigames.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hunter_catches',
			description: 'Check the hunter catch leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'creature',
					description: 'The particular creature you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Hunter.Creatures.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'agility_laps',
			description: 'Check the agility laps leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'course',
					description: 'The particular creature you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Agility.Courses.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'gp',
			description: 'Check the GP leaderboard.',
			options: [ironmanOnlyOption]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'skills',
			description: 'Check the skills/xp/levels leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'skill',
					description: 'The skill you want to select.',
					required: true,
					choices: [
						{ name: 'Overall', value: 'overall' },
						...Object.values(SkillsEnum).map(i => ({ name: toTitleCase(i), value: i }))
					]
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'xp',
					description: 'Show XP instead of levels.',
					required: false
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'opens',
			description: 'Check the opening leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'openable',
					description: 'The openable you want to select.',
					required: true,
					autocomplete: async (value: string) => {
						return allOpenables
							.filter(i =>
								!value
									? true
									: [i.name, ...i.aliases].some(str =>
											str.toLowerCase().includes(value.toLowerCase())
									  )
							)
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cl',
			description: 'Check the collection log leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'cl',
					description: 'The cl you want to select.',
					required: true,
					autocomplete: async value => {
						return [
							{ name: 'Overall (Main Leaderboard)', value: 'overall' },
							...['overall+', ...allClNames.map(i => i)].map(i => ({
								name: toTitleCase(i),
								value: i
							}))
						].filter(o => (!value ? true : o.name.toLowerCase().includes(value.toLowerCase())));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'clues',
			description: 'Check the clue leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'clue',
					description: 'The clue you want to select.',
					required: true,
					choices: ClueTiers.map(i => ({ name: i.name, value: i.name }))
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'movers',
			description: 'Check the movers leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The type of movers you want to check.',
					required: true,
					choices: gainersTypes.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'global',
			description: 'Check the global (OSB+BSO) leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The global leaderboard type you want to check.',
					required: true,
					choices: globalLbTypes.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'combat_achievements',
			description: 'Check the combat achievements leaderboards.',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'mastery',
			description: 'Check the mastery leaderboard.',
			options: []
		}
	],
	run: async ({
		channelID,
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		kc?: { monster: string; ironmen_only?: boolean };
		farming_contracts?: { ironmen_only?: boolean };
		inferno?: {};
		sacrifice?: { type: 'value' | 'unique'; ironmen_only?: boolean };
		minigames?: { minigame: string; ironmen_only?: boolean };
		hunter_catches?: { creature: string };
		agility_laps?: { course: string };
		gp?: { ironmen_only?: boolean };
		skills?: { skill: string; ironmen_only?: boolean; xp?: boolean };
		opens?: { openable: string; ironmen_only?: boolean };
		cl?: { cl: string; ironmen_only?: boolean };
		clues?: { clue: ClueTier['name']; ironmen_only?: boolean };
		movers?: { type: GainersType };
		global?: {
			type: GlobalLbType;
		};
		combat_achievements?: {};
		mastery?: {};
	}>) => {
		deferInteraction(interaction);
		const user = await mUserFetch(userID);
		const {
			opens,
			kc,
			farming_contracts,
			inferno,
			sacrifice,
			minigames,
			hunter_catches,
			agility_laps,
			gp,
			skills,
			cl,
			clues,
			movers,
			global,
			combat_achievements,
			mastery
		} = options;
		if (kc) return kcLb(interaction, user, channelID, kc.monster, Boolean(kc.ironmen_only));
		if (farming_contracts) {
			return farmingContractLb(interaction, user, channelID, Boolean(farming_contracts.ironmen_only));
		}
		if (inferno) return infernoLb();
		if (sacrifice) {
			return sacrificeLb(interaction, user, channelID, sacrifice.type, Boolean(sacrifice.ironmen_only));
		}
		if (minigames) {
			return minigamesLb(interaction, user, channelID, minigames.minigame);
		}
		if (hunter_catches) {
			return creaturesLb(interaction, user, channelID, hunter_catches.creature);
		}
		if (agility_laps) return lapsLb(interaction, user, channelID, agility_laps.course);
		if (gp) return gpLb(interaction, user, channelID, Boolean(gp.ironmen_only));
		if (skills) {
			return skillsLb(
				interaction,
				user,
				channelID,
				skills.skill,
				skills.xp ? 'xp' : 'level',
				Boolean(skills.ironmen_only)
			);
		}
		if (opens) return openLb(interaction, user, channelID, opens.openable, Boolean(opens.ironmen_only));
		if (cl) return clLb(interaction, user, channelID, cl.cl, Boolean(cl.ironmen_only));
		if (clues) return cluesLb(interaction, user, channelID, clues.clue, Boolean(clues.ironmen_only));
		if (movers) return gainersLB(interaction, user, channelID, movers.type);
		if (global) return globalLb(interaction, user, channelID, global.type);
		if (combat_achievements) return caLb(interaction, user, channelID);
		if (mastery) return masteryLb(interaction, user, channelID);
		return 'Invalid input.';
	}
};
