import {
	calcWhatPercent,
	chunk,
	formatDuration,
	isFunction,
	stringMatches,
	toTitleCase,
	uniqueArr
} from '@oldschoolgg/toolkit';
import { EmbedBuilder } from 'discord.js';
import { convertXPtoLVL } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { MAX_LEVEL, masteryKey } from '@/lib/constants.js';
import { allClNames, getCollectionItems } from '@/lib/data/Collections.js';
import { defineOption } from '@/lib/discord/index.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { allOpenables } from '@/lib/openables.js';
import { SQL } from '@/lib/rawSql.js';
import { Minigames } from '@/lib/settings/minigames.js';
import Agility from '@/lib/skilling/skills/agility.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import { fetchCLLeaderboard } from '@/lib/util/clLeaderboard.js';
import { userEventsToMap } from '@/lib/util/userEvents.js';
import { getUsername, getUsernameSync } from '@/lib/util.js';

const LB_PAGE_SIZE = 10;

async function bulkGetUsernames(userIDs: string[]) {
	await Promise.all(uniqueArr(userIDs).map(id => getUsername(id)));
}

function getPos(page: number, record: number) {
	return `${page * LB_PAGE_SIZE + 1 + record}. `;
}

type AsyncPageString = () => Promise<string>;
export async function doMenu(interaction: MInteraction, pages: string[] | AsyncPageString[], title: string) {
	if (pages.length === 0) {
		return 'There are no users on this leaderboard.';
	}

	return interaction.makePaginatedMessage({
		pages: pages.map((p, i) => {
			if (isFunction(p)) {
				return async currentIndex => ({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${title} (Page ${currentIndex + 1}/${pages.length})`)
							.setDescription(await p())
					]
				});
			}

			return {
				embeds: [new EmbedBuilder().setTitle(`${title} (Page ${i + 1}/${pages.length})`).setDescription(p)]
			};
		})
	});
}

async function doMenuWrapper({
	users,
	title,
	ironmanOnly,
	formatter,
	interaction
}: {
	ironmanOnly: boolean;
	users: { id: string; score: number; full_name?: string }[];
	title: string;
	interaction: MInteraction;
	formatter?: (val: number) => string;
}) {
	const chunked = chunk(users, LB_PAGE_SIZE);
	const pages: (() => Promise<CompatibleResponse>)[] = [];
	for (let c = 0; c < chunked.length; c++) {
		const makePage = async () => {
			const chnk = chunked[c];
			await bulkGetUsernames(chnk.map(u => u.id));
			const unwaited = chnk.map(
				async (user, i) =>
					`${getPos(c, i)}**${user.full_name ?? (await getUsername(user.id))}:** ${formatter ? formatter(user.score) : user.score.toLocaleString()}`
			);
			const pageText = (await Promise.all(unwaited)).join('\n');
			return {
				embeds: [
					new EmbedBuilder()
						.setTitle(`${title}${ironmanOnly ? ' (Ironmen Only)' : ''}`)
						.setDescription(pageText)
				]
			};
		};
		pages.push(makePage);
	}
	if (pages.length === 0) {
		return 'There are no users on this leaderboard.';
	}

	return interaction.makePaginatedMessage({
		pages
	});
}

async function kcLb(interaction: MInteraction, name: string, ironmanOnly: boolean) {
	const monster = effectiveMonsters.find(mon => [mon.name, ...mon.aliases].some(alias => stringMatches(alias, name)));
	if (!monster) return "That's not a valid monster!";
	const list = await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
		`SELECT user_id::text AS id, CAST("monster_scores"->>'${monster.id}' AS INTEGER) as score
		 FROM user_stats
		${ironmanOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
		 WHERE CAST("monster_scores"->>'${monster.id}' AS INTEGER) > 5
		 ${ironmanOnly ? ' AND "users"."minion.ironman" = true ' : ''}
		 ORDER BY score DESC
		 LIMIT 2000;`
	);

	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: list,
		title: `KC Leaderboard for ${monster.name}`
	});
}

async function farmingContractLb(interaction: MInteraction, ironmanOnly: boolean) {
	const list = await prisma.$queryRawUnsafe<{ id: string; count: number }[]>(
		`SELECT id, CAST("minion.farmingContract"->>'contractsCompleted' AS INTEGER) as count
		 FROM users
		 WHERE "minion.farmingContract" is not null and CAST ("minion.farmingContract"->>'contractsCompleted' AS INTEGER) >= 1
		 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
		 ORDER BY count DESC
		 LIMIT 2000;`
	);

	return doMenu(
		interaction,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => {
					return `${getPos(i, j)}**${getUsernameSync(id)}:** ${count.toLocaleString()}`;
				})
				.join('\n')
		),
		'Farming Contracts Leaderboard'
	);
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
		.map((e, i) => `${i + 1}. **${getUsernameSync(e.user_id)}:** ${formatDuration(e.duration)}`)
		.join('\n')}`;
}

async function sacrificeLb(interaction: MInteraction, type: 'value' | 'unique', ironmanOnly: boolean) {
	if (type === 'value') {
		const list = (
			await prisma.$queryRawUnsafe<{ id: string; full_name: string; amount: number }[]>(
				`SELECT
	u.id,
    ${SQL.SELECT_FULL_NAME},
	"sacrificedValue"
FROM
    users u
${SQL.LEFT_JOIN_BADGES}
WHERE
    "sacrificedValue" > 10000
${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
${SQL.GROUP_BY_U_ID}
ORDER BY "sacrificedValue" DESC
LIMIT 400;`
			)
		).map((res: any) => ({ ...res, amount: Number.parseInt(res.sacrificedValue) }));

		return doMenu(
			interaction,
			chunk(list, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(
						({ full_name, amount }, j) => `${getPos(i, j)}**${full_name}:** ${amount.toLocaleString()} GP `
					)
					.join('\n')
			),
			'Sacrifice Leaderboard'
		);
	}

	const mostUniques: { full_name: string; sacbanklength: number }[] = await prisma.$queryRawUnsafe(
		`
SELECT
    ${SQL.SELECT_FULL_NAME},
    u.sacbanklength
FROM (
    SELECT
        (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS(sacrificed_bank)) AS sacbanklength,
        u.id AS user_id,
        u.username,
        u.badges
    FROM
        user_stats
    INNER JOIN
        users u ON u.id::bigint = user_stats.user_id
	WHERE
		sacrificed_bank::text != '{}'
		${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
) u
LEFT JOIN
    badges b ON b.id = ANY(u.badges)
GROUP BY
    u.username, u.sacbanklength
ORDER BY
    u.sacbanklength DESC
LIMIT 10;
`
	);
	return doMenu(
		interaction,
		chunk(mostUniques, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ full_name, sacbanklength }, j) =>
						`${getPos(i, j)}**${full_name}:** ${sacbanklength.toLocaleString()} Unique Sac's`
				)
				.join('\n')
		),
		'Unique Sacrifice Leaderboard'
	);
}

async function minigamesLb(interaction: MInteraction, name: string, ironmanOnly: boolean) {
	const minigame = Minigames.find(m => stringMatches(m.name, name) || m.aliases.some(a => stringMatches(a, name)));
	if (!minigame) {
		return `That's not a valid minigame. Valid minigames are: ${Minigames.map(m => m.name).join(', ')}.`;
	}

	if (minigame.name === 'Tithe farm') {
		const titheJoin = ironmanOnly ? 'INNER JOIN "users" u ON u."id" = user_stats.user_id::text' : '';
		const titheCondition = ironmanOnly ? ' AND u."minion.ironman" = true ' : '';
		const titheCompletions = await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT user_stats.user_id::text as id, "tithe_farms_completed"::int as score
                                           FROM user_stats
                                           ${titheJoin}
                                           WHERE "tithe_farms_completed" > 10
                                           ${titheCondition}
                                           ORDER BY "tithe_farms_completed" DESC
                                           LIMIT 200;`
		);
		return doMenuWrapper({
			ironmanOnly,
			interaction,
			users: titheCompletions,
			title: 'Tithe farm Leaderboard'
		});
	}

	const res = await prisma.minigame.findMany({
		where: {
			[minigame.column]: {
				gt: minigame.column === 'champions_challenge' ? 1 : 10
			},
			...(ironmanOnly
				? {
						user: {
							minion_ironman: true
						}
					}
				: {})
		},
		orderBy: {
			[minigame.column]: 'desc'
		},
		take: 200
	});

	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: res.map(u => ({ id: u.user_id, score: u[minigame.column] })),
		title: `${minigame.name} Leaderboard`
	});
}

async function clLb(interaction: MInteraction, inputType: string, ironmenOnly: boolean) {
	const { resolvedCl, items } = getCollectionItems(inputType, false, false, true);
	if (!items || items.size === 0) {
		return "That's not a valid collection log category. Check /cl for all possible logs.";
	}

	const { users } = await fetchCLLeaderboard({ ironmenOnly, items, resultLimit: 200, clName: resolvedCl });
	inputType = toTitleCase(inputType.toLowerCase());

	return doMenuWrapper({
		ironmanOnly: ironmenOnly,
		interaction,
		users: users.map(u => ({ id: u.id, score: u.qty })),
		title: `${inputType} Collection Log Leaderboard`,
		formatter: val => `${val.toLocaleString()} (${calcWhatPercent(val, items.size).toFixed(1)}%)`
	});
}

async function creaturesLb(interaction: MInteraction, creatureName: string) {
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
	return doMenu(
		interaction,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsernameSync(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`Catch Leaderboard for ${creature.name}`
	);
}

async function lapsLb(interaction: MInteraction, courseName: string) {
	const course = Agility.Courses.find(course => course.aliases.some(alias => stringMatches(alias, courseName)));

	if (!course) return 'Thats not a valid agility course.';

	const data: { id: string; count: number }[] = await prisma.$queryRawUnsafe(
		`SELECT user_id::text as id, ("laps_scores"->>'${course.id}')::int as count
			 FROM user_stats
			 WHERE "laps_scores"->>'${course.id}' IS NOT NULL
			 ORDER BY count DESC LIMIT 50;`
	);
	return doMenu(
		interaction,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsernameSync(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`${course.name} Laps Leaderboard`
	);
}

async function openLb(interaction: MInteraction, name: string, ironmanOnly: boolean) {
	if (name) {
		name = name.trim();
	}

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
		return `That's not a valid openable item! You can check: ${allOpenables
			.map(i => i.name)
			.join(', ')
			.slice(0, 1900)}.`;
	}

	const list = await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
		`SELECT user_id::text AS id, ("${key}"->>'${entityID}')::int as qty FROM user_stats
			${ironmanOnly ? 'INNER JOIN users ON users.id::bigint = user_stats.user_id' : ''}
			WHERE ("${key}"->>'${entityID}')::int > 3
			${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
			ORDER BY qty DESC LIMIT 30;`
	);

	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: list.map(u => ({ id: u.id, score: u.qty })),
		title: `${openableName} Opening Leaderboard`
	});
}

async function gpLb(interaction: MInteraction, ironmanOnly: boolean) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; GP: number }[]>(
			`SELECT "id", "GP"
					   FROM users
					   WHERE "GP" > 1000000
					   ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY "GP" DESC
					   LIMIT 100;`
		)
	).map(res => ({ ...res, score: Number(res.GP) }));

	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users,
		title: 'GP Leaderboard',
		formatter: val => `${val.toLocaleString()} GP`
	});
}

async function skillsLb(interaction: MInteraction, inputSkill: string, type: 'xp' | 'level', ironmanOnly: boolean) {
	let res = [];
	let overallUsers: {
		id: string;
		totalLevel: number;
		ironman: boolean;
		totalXP: number;
	}[] = [];

	const skillsVals = Object.values(Skills);

	const skill = skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, inputSkill)));

	if (inputSkill === 'overall') {
		const maxTotalLevelEventMap = await prisma.userEvent
			.findMany({
				where: {
					type: 'MaxTotalLevel'
				},
				orderBy: {
					date: 'asc'
				}
			})
			.then(res => userEventsToMap(res));
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
				totalLevel += convertXPtoLVL(Number(user[`skills.${skill.id}`]) as any, MAX_LEVEL);
			}
			return {
				id: user.id,
				totalLevel,
				ironman: user['minion.ironman'],
				totalXP: Number(user.totalxp!)
			};
		});
		if (type === 'level') {
			overallUsers.sort((a, b) => {
				const valueDifference = b.totalLevel - a.totalLevel;
				if (valueDifference !== 0) {
					return valueDifference;
				}
				const xpDiff = b.totalXP - a.totalXP;
				if (xpDiff !== 0) {
					return xpDiff;
				}
				const dateA = maxTotalLevelEventMap.get(a.id);
				const dateB = maxTotalLevelEventMap.get(b.id);
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
				type: 'MaxXP',
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
		return doMenu(
			interaction,
			chunk(overallUsers, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map((obj, j) => {
						return `${getPos(i, j)}**${getUsernameSync(
							obj.id
						)}:** ${obj.totalLevel.toLocaleString()} (${obj.totalXP.toLocaleString()} XP)`;
					})
					.join('\n')
			),
			`Overall ${type} Leaderboard`
		);
	}

	return doMenu(
		interaction,
		chunk(res, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((obj, j) => {
					const objKey = `skills.${skill?.id}`;
					const skillXP = Number(obj[objKey] ?? 0);

					return `${getPos(i, j)}**${getUsernameSync(obj.id)}:** ${skillXP.toLocaleString()} XP (${convertXPtoLVL(
						skillXP,
						MAX_LEVEL
					)})`;
				})
				.join('\n')
		),
		`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
	);
}

async function cluesLb(interaction: MInteraction, clueTierName: string, ironmanOnly: boolean) {
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

	return doMenu(
		interaction,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, score }, j) =>
						`${getPos(i, j)}**${getUsernameSync(id)}:** ${score.toLocaleString()} Completed`
				)
				.join('\n')
		),
		`${clueTier.name} Clue Leaderboard`
	);
}

const globalLbTypes = ['xp', 'cl', 'mastery'] as const;
type GlobalLbType = (typeof globalLbTypes)[number];
async function globalLb(interaction: MInteraction, type: GlobalLbType) {
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
       (bso_total_xp / (5000000000.0 * 26) * 100) as bso_xp_percent,
       (((osb_total_xp / (200000000.0 * 23) * 100) + (bso_total_xp / (5000000000.0 * 26) * 100)) / 2) as average_percentage
FROM public.user
WHERE osb_total_xp IS NOT NULL AND bso_total_xp IS NOT NULL
ORDER BY average_percentage DESC
LIMIT 10;
`;
		return doMenu(
			interaction,
			chunk(result, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(
						({ id, osb_xp_percent, bso_xp_percent }, j) =>
							`${getPos(i, j)}**${getUsernameSync(id)}:** ${osb_xp_percent.toFixed(
								2
							)}% OSB, ${bso_xp_percent.toFixed(2)}% BSO`
					)
					.join('\n')
			),
			'Global (OSB+BSO) XP Leaderboard (% of the max XP)'
		);
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
		return doMenu(
			interaction,
			chunk(result, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(({ id, avg }, j) => `${getPos(i, j)}**${getUsernameSync(id)}:** ${avg.toFixed(2)}%`)
					.join('\n')
			),
			'Global (OSB+BSO) Mastery Leaderboard'
		);
	}

	const result = await roboChimpClient.$queryRaw<
		{ id: string; total_cl_percent: number }[]
	>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
FROM public.user
WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
ORDER BY total_cl_percent DESC
LIMIT 20;`;

	return doMenu(
		interaction,
		chunk(result, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, total_cl_percent }, j) =>
						`${getPos(i, j)}**${getUsernameSync(id)}:** ${total_cl_percent.toLocaleString()}%`
				)
				.join('\n')
		),
		'Global (OSB+BSO) CL Leaderboard'
	);
}

const gainersTypes = ['overall', 'top_250'] as const;
type GainersType = (typeof gainersTypes)[number];
async function gainersLB(interaction: MInteraction, type: GainersType) {
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

	return doMenu(
		interaction,
		chunk(result, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ user_id, cl_completion_count, cl_global_rank, count_increase, rank_difference }, j) =>
						`${getPos(i, j)}**${getUsernameSync(
							user_id
						)}:** Gained ${count_increase} CL slots, from ${cl_completion_count} to ${
							cl_completion_count + count_increase
						}, and their global rank went from ${cl_global_rank - rank_difference} to ${cl_global_rank}`
				)
				.join('\n')
		),
		'Weekly Movers Leaderboard'
	);
}

async function caLb(interaction: MInteraction) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
			`SELECT id, CARDINALITY(completed_ca_task_ids) AS qty
FROM users
WHERE CARDINALITY(completed_ca_task_ids) > 0
ORDER BY CARDINALITY(completed_ca_task_ids) DESC
LIMIT 50;`
		)
	).map(res => ({ ...res, score: Number(res.qty) }));

	return doMenu(
		interaction,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, qty }, j) =>
						`${getPos(i, j)}**${getUsernameSync(id)}:** ${qty.toLocaleString()} Tasks Completed`
				)
				.join('\n')
		),
		'Combat Achievements Leaderboard'
	);
}

async function masteryLb(interaction: MInteraction) {
	const users = (
		await roboChimpClient.user.findMany({
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
		})
	).map(u => ({ id: u.id.toString(), score: u[masteryKey] ?? 0 }));

	return doMenuWrapper({
		interaction,
		title: 'Mastery Leaderboard',
		ironmanOnly: false,
		users,
		formatter: val => `${val.toFixed(3)}% mastery`
	});
}

const ironmanOnlyOption = defineOption({
	type: 'Boolean',
	name: 'ironmen_only',
	description: 'Only include ironmen.',
	required: false
});

export const leaderboardCommand = defineCommand({
	name: 'lb',
	description: 'Simulate killing monsters.',
	options: [
		{
			type: 'Subcommand',
			name: 'kc',
			description: 'Check the kc leaderboard.',
			options: [
				{
					type: 'String',
					name: 'monster',
					description: 'The monster you want to check the leaderboard of.',
					required: true,
					autocomplete: async (value: string) => {
						return effectiveMonsters
							.filter(m => (!value ? true : m.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: 'Subcommand',
			name: 'farming_contracts',
			description: 'Check the farming contracts leaderboard.',
			options: [ironmanOnlyOption]
		},
		{
			type: 'Subcommand',
			name: 'inferno',
			description: 'Check the inferno leaderboard.'
		},
		{
			type: 'Subcommand',
			name: 'sacrifice',
			description: 'Check the sacrifice leaderboard.',
			options: [
				{
					type: 'String',
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
			type: 'Subcommand',
			name: 'minigames',
			description: 'Check the minigames leaderboard.',
			options: [
				{
					type: 'String',
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
				},
				ironmanOnlyOption
			]
		},
		{
			type: 'Subcommand',
			name: 'hunter_catches',
			description: 'Check the hunter catch leaderboard.',
			options: [
				{
					type: 'String',
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
			type: 'Subcommand',
			name: 'agility_laps',
			description: 'Check the agility laps leaderboard.',
			options: [
				{
					type: 'String',
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
			type: 'Subcommand',
			name: 'gp',
			description: 'Check the GP leaderboard.',
			options: [ironmanOnlyOption]
		},
		{
			type: 'Subcommand',
			name: 'skills',
			description: 'Check the skills/xp/levels leaderboards.',
			options: [
				{
					type: 'String',
					name: 'skill',
					description: 'The skill you want to select.',
					required: true,
					choices: [
						{ name: 'Overall', value: 'overall' },
						...SkillsArray.map(i => ({ name: toTitleCase(i), value: i }))
					]
				},
				{
					type: 'Boolean',
					name: 'xp',
					description: 'Show XP instead of levels.',
					required: false
				},
				ironmanOnlyOption
			]
		},
		{
			type: 'Subcommand',
			name: 'opens',
			description: 'Check the opening leaderboards.',
			options: [
				{
					type: 'String',
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
			type: 'Subcommand',
			name: 'cl',
			description: 'Check the collection log leaderboards.',
			options: [
				{
					type: 'String',
					name: 'cl',
					description: 'The cl you want to select.',
					required: true,
					autocomplete: async (value: string) => {
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
			type: 'Subcommand',
			name: 'clues',
			description: 'Check the clue leaderboards.',
			options: [
				{
					type: 'String',
					name: 'clue',
					description: 'The clue you want to select.',
					required: true,
					choices: ClueTiers.map(i => ({ name: i.name, value: i.name }))
				},
				ironmanOnlyOption
			]
		},
		{
			type: 'Subcommand',
			name: 'movers',
			description: 'Check the movers leaderboards.',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'The type of movers you want to check.',
					required: true,
					choices: gainersTypes.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'global',
			description: 'Check the global (OSB+BSO) leaderboards.',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'The global leaderboard type you want to check.',
					required: true,
					choices: globalLbTypes.map(i => ({ name: i, value: i }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'combat_achievements',
			description: 'Check the combat achievements leaderboards.',
			options: []
		},
		{
			type: 'Subcommand',
			name: 'mastery',
			description: 'Check the mastery leaderboard.',
			options: []
		}
	],
	run: async ({ options, interaction }) => {
		await interaction.defer();
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
		if (kc) return kcLb(interaction, kc.monster, Boolean(kc.ironmen_only));
		if (farming_contracts) {
			return farmingContractLb(interaction, Boolean(farming_contracts.ironmen_only));
		}
		if (inferno) return infernoLb();
		if (sacrifice) {
			return sacrificeLb(interaction, sacrifice.type, Boolean(sacrifice.ironmen_only));
		}
		if (minigames) {
			return minigamesLb(interaction, minigames.minigame, Boolean(minigames.ironmen_only));
		}
		if (hunter_catches) {
			return creaturesLb(interaction, hunter_catches.creature);
		}
		if (agility_laps) return lapsLb(interaction, agility_laps.course);
		if (gp) return gpLb(interaction, Boolean(gp.ironmen_only));
		if (skills) {
			return skillsLb(interaction, skills.skill, skills.xp ? 'xp' : 'level', Boolean(skills.ironmen_only));
		}
		if (opens) return openLb(interaction, opens.openable, Boolean(opens.ironmen_only));
		if (cl) return clLb(interaction, cl.cl, Boolean(cl.ironmen_only));
		if (clues) return cluesLb(interaction, clues.clue, Boolean(clues.ironmen_only));
		if (movers) return gainersLB(interaction, movers.type);
		if (global) return globalLb(interaction, global.type);
		if (combat_achievements) return caLb(interaction);
		if (mastery) return masteryLb(interaction);
		return 'Invalid input.';
	}
});
