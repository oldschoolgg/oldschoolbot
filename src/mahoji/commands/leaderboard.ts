import { calcWhatPercent, formatDuration, stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { convertXPtoLVL } from 'oldschooljs';

import { choicesOf, defineOption } from '@/discord/index.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { MAX_LEVEL, masteryKey } from '@/lib/constants.js';
import { allClNames, getCollectionItems } from '@/lib/data/Collections.js';
import { doMenuWrapper } from '@/lib/menuWrapper.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { allOpenables } from '@/lib/openables.js';
import { Minigames } from '@/lib/settings/minigames.js';
import Agility from '@/lib/skilling/skills/agility.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { type SkillNameType, SkillsArray } from '@/lib/skilling/types.js';
import { fetchCLLeaderboard, fetchTameCLLeaderboard } from '@/lib/util/clLeaderboard.js';
import { userEventsToMap } from '@/lib/util/userEvents.js';

async function kcLb(interaction: MInteraction, name: string, ironmanOnly: boolean, tame: boolean) {
	const monster = effectiveMonsters.find(mon => [mon.name, ...mon.aliases].some(alias => stringMatches(alias, name)));
	if (!monster) return "That's not a valid monster!";
	const list = tame
		? await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT ta.user_id::text AS id, SUM((ta.data->>'quantity')::int) AS score
                  FROM tame_activity ta
                  ${ironmanOnly ? 'INNER JOIN users u ON u.id = ta.user_id' : ''}
                 WHERE ta.completed = true
                   AND (ta.data->>'monsterID')::int = ${monster.id}
                   AND ta.type = 'pvm'
                   ${ironmanOnly ? 'AND u."minion.ironman" = true' : ''}
                 GROUP BY ta.user_id
                 ORDER BY score DESC
                 LIMIT 2000;`
		)
		: await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT user_id::text AS id, CAST("monster_scores"->>'${monster.id}' AS INTEGER) as score
		 FROM user_stats
		${ironmanOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
		 WHERE CAST("monster_scores"->>'${monster.id}' AS INTEGER) > 5
		 ${ironmanOnly ? ' AND "users"."minion.ironman" = true ' : ''}
		 ORDER BY score DESC
		 LIMIT 2000;`
		);
	const prefixParts: string[] = [];
	if (tame) prefixParts.push('Tame');
	if (ironmanOnly) prefixParts.push('Ironman');
	const prefix = prefixParts.length ? `${prefixParts.join(' ')} ` : '';
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: list,
		title: `${prefix}KC Leaderboard for ${monster.name}`
	});
}

async function farmingContractLb(interaction: MInteraction, ironmanOnly: boolean) {
	const list = await prisma.$queryRawUnsafe<{ id: string; count: number }[]>(
		`SELECT id::text as id, CAST("minion.farmingContract"->>'contractsCompleted' AS INTEGER) as count
		 FROM users
		 WHERE "minion.farmingContract" is not null and CAST ("minion.farmingContract"->>'contractsCompleted' AS INTEGER) >= 1
		 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
		 ORDER BY count DESC
		 LIMIT 2000;`
	);
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: list.map(u => ({ id: u.id, score: u.count })),
		title: 'Farming Contracts Leaderboard'
	});
}

async function infernoLb(interaction: MInteraction) {
	const res = await prisma.$queryRawUnsafe<{ user_id: string; duration: number }[]>(
		`SELECT user_id, duration
		 FROM activity
		 WHERE type = 'Inferno'
		   AND data->>'deathTime' IS NULL
		   AND completed = true
		 ORDER BY duration ASC
		 LIMIT 10;`
	);
	if (res.length === 0) return 'There are no users on this leaderboard.';
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: res.map(r => ({ id: r.user_id, score: r.duration })),
		title: 'Inferno Records',
		formatter: v => formatDuration(v)
	});
}

async function sacrificeLb(interaction: MInteraction, type: 'value' | 'unique', ironmanOnly: boolean) {
	if (type === 'value') {
		const list = await prisma.$queryRawUnsafe<{ id: string; amount: number }[]>(
			`SELECT
				u.id::text,
				"sacrificedValue"::bigint AS amount
			 FROM users u
			 WHERE "sacrificedValue" > 10000
			 ${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
			 ORDER BY "sacrificedValue" DESC
			 LIMIT 400;`
		);
		return doMenuWrapper({
			ironmanOnly,
			interaction,
			users: list.map(u => ({ id: u.id, score: Number(u.amount) })),
			title: 'Sacrifice Leaderboard',
			formatter: v => `${v.toLocaleString()} GP`
		});
	}
	const mostUniques = await prisma.$queryRawUnsafe<{ id: string; sacbanklength: number }[]>(
		`
		SELECT
			u.id::text AS id,
			(SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS(us.sacrificed_bank)) AS sacbanklength
		FROM users u
		INNER JOIN user_stats us ON u.id::bigint = us.user_id
		WHERE us.sacrificed_bank::text != '{}'
		${ironmanOnly ? 'AND u."minion.ironman" = true' : ''}
		ORDER BY sacbanklength DESC
		LIMIT 10;`
	);
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users: mostUniques.map(u => ({ id: u.id, score: u.sacbanklength })),
		title: 'Unique Sacrifice Leaderboard',
		formatter: v => `${v.toLocaleString()} Unique Sac's`
	});
}

async function minigamesLb(interaction: MInteraction, name: string) {
	const minigame = Minigames.find(m => stringMatches(m.name, name) || m.aliases.some(a => stringMatches(a, name)));
	if (!minigame) return `That's not a valid minigame. Valid minigames are: ${Minigames.map(m => m.name).join(', ')}.`;
	if (minigame.name === 'Tithe farm') {
		const tithe = await prisma.$queryRawUnsafe<{ id: string; amount: number }[]>(
			`SELECT user_id::text as id, tithe_farms_completed::int as amount
			 FROM user_stats
			 WHERE "tithe_farms_completed" > 10
			 ORDER BY "tithe_farms_completed" DESC
			 LIMIT 10;`
		);
		return doMenuWrapper({
			ironmanOnly: false,
			interaction,
			users: tithe.map(t => ({ id: t.id, score: t.amount })),
			title: 'Tithe farm Leaderboard'
		});
	}
	const res = await prisma.minigame.findMany({
		where: { [minigame.column]: { gt: minigame.column === 'champions_challenge' ? 1 : 10 } },
		orderBy: { [minigame.column]: 'desc' },
		take: 10
	});
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: res.map(u => ({ id: u.user_id, score: u[minigame.column] })),
		title: `${minigame.name} Leaderboard`
	});
}

async function clLb(interaction: MInteraction, inputType: string, ironmenOnly: boolean, tames: boolean) {
	const { resolvedCl, items } = getCollectionItems(inputType, false, false, true);
	if (!items || items.size === 0) {
		return "That's not a valid collection log category. Check /cl for all possible logs.";
	}
	inputType = toTitleCase(inputType.toLowerCase());

	if (tames) {
		const tameLb = await fetchTameCLLeaderboard({ items, resultLimit: 200 });
		return doMenuWrapper(
			{
				interaction,
				ironmanOnly: false,
				users: tameLb.map(u => ({ id: u.user_id, score: u.qty })),
				title: `${inputType} Tame Collection Log Leaderboard (${items.size} slots)`,
				formatter: val => `${val.toLocaleString()} (${calcWhatPercent(val, items.size).toFixed(1)}%)`
			});

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
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: data.map(d => ({ id: d.id, score: d.count })),
		title: `Catch Leaderboard for ${creature.name}`
	});
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
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: data.map(d => ({ id: d.id, score: d.count })),
		title: `${course.name} Laps Leaderboard`
	});
}

async function openLb(interaction: MInteraction, name: string, ironmanOnly: boolean) {
	if (name) name = name.trim();
	let entityID = -1;
	let openableName = '';
	const openable = !name
		? undefined
		: allOpenables.find(
			item => stringMatches(item.name, name) || item.name.toLowerCase().includes(name.toLowerCase())
		);
	if (openable) {
		entityID = openable.id;
		openableName = openable.name;
	}
	if (entityID === -1) {
		return `That's not a valid openable item! You can check: ${allOpenables
			.map(i => i.name)
			.join(', ')
			.slice(0, 1900)}.`;
	}
	const list = await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
		`SELECT user_id::text AS id, ("openable_scores"->>'${entityID}')::int as qty FROM user_stats
			${ironmanOnly ? 'INNER JOIN users ON users.id::bigint = user_stats.user_id' : ''}
			WHERE ("openable_scores"->>'${entityID}')::int > 3
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
			`SELECT "id"::text as id, "GP"
			 FROM users
			 WHERE "GP" > 1000000
			 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
			 ORDER BY "GP" DESC
			 LIMIT 100;`
		)
	).map(res => ({ id: res.id, score: Number(res.GP) }));
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users,
		title: 'GP Leaderboard',
		formatter: val => `${val.toLocaleString()} GP`
	});
}

async function skillsLb(interaction: MInteraction, inputSkill: string, type: 'xp' | 'level', ironmanOnly: boolean) {
	let res: ({ id: string; totalxp: bigint } & Record<`skills.${SkillNameType}`, bigint>)[] = [];
	let overallUsers: { id: string; totalLevel: number; totalXP: number }[] = [];
	const skillsVals = Object.values(Skills);
	const skill = skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, inputSkill)));

	if (inputSkill === 'overall') {
		const maxTotalLevelEventMap = await prisma.userEvent
			.findMany({ where: { type: 'MaxTotalLevel' }, orderBy: { date: 'asc' } })
			.then(res2 => userEventsToMap(res2));
		const query = `SELECT
			u.id::text as id,
			${skillsVals.map(s => `"skills.${s.id}"`)},
			${skillsVals.map(s => `"skills.${s.id}"::int8`).join(' + ')} as totalxp
		FROM users u
		${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
		ORDER BY totalxp DESC
		LIMIT 2000;`;
		res =
			await prisma.$queryRawUnsafe<
				({ id: string; totalxp: bigint } & Record<`skills.${SkillNameType}`, bigint>)[]
			>(query);
		overallUsers = res.map(user => {
			let totalLevel = 0;
			for (const s of skillsVals) totalLevel += convertXPtoLVL(Number(user[`skills.${s.id}`]), MAX_LEVEL);
			return { id: user.id, totalLevel, totalXP: Number(user.totalxp!) };
		});
		if (type === 'level') {
			overallUsers.sort((a, b) => {
				const d = b.totalLevel - a.totalLevel;
				if (d !== 0) return d;
				const x = b.totalXP - a.totalXP;
				if (x !== 0) return x;
				const dateA = maxTotalLevelEventMap.get(a.id);
				const dateB = maxTotalLevelEventMap.get(b.id);
				if (dateA && dateB) return dateA - dateB;
				if (dateA) return -1;
				if (dateB) return 1;
				return 0;
			});
		}
		const users = overallUsers.slice(0, 100).map(u => ({
			id: u.id,
			score: type === 'xp' ? u.totalXP : u.totalLevel,
			extraLevel: u.totalLevel,
			extraXP: u.totalXP
		}));
		return doMenuWrapper({
			ironmanOnly,
			interaction,
			users,
			title: `Overall ${type} Leaderboard`,
			render: (u, username) =>
				type === 'xp'
					? `**${username}:** ${u.extraXP.toLocaleString()} XP (${u.extraLevel.toLocaleString()})`
					: `**${username}:** ${u.extraLevel.toLocaleString()} (${u.extraXP.toLocaleString()} XP)`
		});
	}

	if (!skill) return "That's not a valid skill.";

	const query = `SELECT u."skills.${skill.id}" as xp, u.id::text as id
		FROM users u
		${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
		ORDER BY 1 DESC
		LIMIT 2000;`;
	const rows = await prisma.$queryRawUnsafe<{ xp: number; id: string }[]>(query);

	const events = await prisma.userEvent.findMany({
		where: { type: 'MaxXP', skill: skill.id },
		orderBy: { date: 'asc' }
	});
	const userEventMap = userEventsToMap(events);
	rows.sort((a, b) => {
		const aXP = Number(a.xp);
		const bXP = Number(b.xp);
		const d = bXP - aXP;
		if (d !== 0) return d;
		const dateA = userEventMap.get(a.id);
		const dateB = userEventMap.get(b.id);
		if (dateA && dateB) return dateA - dateB;
		if (dateA) return -1;
		if (dateB) return 1;
		return 0;
	});

	const users = rows.map(r => {
		const lvl = convertXPtoLVL(Number(r.xp), MAX_LEVEL);
		return { id: r.id, score: Number(r.xp), level: lvl };
	});
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users,
		title: `${toTitleCase(skill.id)} Leaderboard`,
		render: (u, username) => `**${username}:** ${u.score.toLocaleString()} XP (${u.level})`
	});
}

async function cluesLb(interaction: MInteraction, clueTierName: string, ironmanOnly: boolean) {
	const clueTier = ClueTiers.find(i => stringMatches(i.name, clueTierName));
	if (!clueTier) return "That's not a valid clue tier.";
	const { id } = clueTier;
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT id::text as id, ("collectionLogBank"->>'${id}')::int AS score
			 FROM users
			 WHERE "collectionLogBank"->>'${id}' IS NOT NULL
			   AND ("collectionLogBank"->>'${id}')::int > 25
			   ${ironmanOnly ? 'AND "minion.ironman" = true ' : ''}
			 ORDER BY ("collectionLogBank"->>'${id}')::int DESC
			 LIMIT 50;`
		)
	).map(res => ({ id: res.id, score: Number(res.score) }));
	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users,
		title: `${clueTier.name} Clue Leaderboard`,
		formatter: v => `${v.toLocaleString()} Completed`
	});
}

const globalLbTypes = ['xp', 'cl', 'mastery'] as const;
type GlobalLbType = (typeof globalLbTypes)[number];

async function globalLb(interaction: MInteraction, type: GlobalLbType) {
	if (type === 'xp') {
		const result = await roboChimpClient.$queryRaw<
			{
				id: string;
				osb_xp_percent: number;
				bso_xp_percent: number;
				average_percentage: number;
			}[]
		>`SELECT id::text,
         (osb_total_xp / (200000000.0 * 23) * 100) as osb_xp_percent,
         (bso_total_xp / (5000000000.0 * 26) * 100) as bso_xp_percent,
         (((osb_total_xp / (200000000.0 * 23) * 100) + (bso_total_xp / (5000000000.0 * 26) * 100)) / 2) as average_percentage
       FROM public.user
       WHERE osb_total_xp IS NOT NULL AND bso_total_xp IS NOT NULL
       ORDER BY average_percentage DESC
       LIMIT 10;`;
		return doMenuWrapper({
			ironmanOnly: false,
			interaction,
			users: result.map(r => ({
				id: r.id,
				score: r.average_percentage,
				osb: r.osb_xp_percent,
				bso: r.bso_xp_percent
			})),
			title: 'Global (OSB+BSO) XP Leaderboard (% of the max XP)',
			render: (u, username) => `**${username}:** ${u.osb.toFixed(2)}% OSB, ${u.bso.toFixed(2)}% BSO`
		});
	}
	if (type === 'mastery') {
		const result = await roboChimpClient.$queryRaw<
			{ id: string; avg: number }[]
		>`SELECT id::text, ((osb_mastery + bso_mastery) / 2) AS avg
			 FROM public.user
			 WHERE osb_mastery IS NOT NULL AND bso_mastery IS NOT NULL
			 ORDER BY avg DESC
			 LIMIT 10;`;
		return doMenuWrapper({
			ironmanOnly: false,
			interaction,
			users: result.map(r => ({ id: r.id, score: r.avg })),
			title: 'Global (OSB+BSO) Mastery Leaderboard',
			formatter: v => `${v.toFixed(2)}%`
		});
	}
	const result = await roboChimpClient.$queryRaw<
		{ id: string; total_cl_percent: number }[]
	>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
		 FROM public.user
		 WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
		 ORDER BY total_cl_percent DESC
		 LIMIT 20;`;
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: result.map(r => ({ id: r.id, score: r.total_cl_percent })),
		title: 'Global (OSB+BSO) CL Leaderboard',
		formatter: v => `${v.toLocaleString()}%`
	});
}

const gainersTypes = ['overall', 'top_250'] as const;
type GainersType = (typeof gainersTypes)[number];
type GainerUser = {
	user_id: string;
	cl_global_rank: number;
	cl_completion_percentage: number;
	cl_completion_count: number;
	count_increase: number;
	rank_difference: number;
	percentage_difference: number;
	score?: number;
};

async function gainersLB(interaction: MInteraction, type: GainersType) {
	const result = await prisma.$queryRawUnsafe<GainerUser[]>(
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
LIMIT 10;`
	);
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users: result.map(r => ({
			id: r.user_id,
			score: type === 'overall' ? r.count_increase : (r.score ?? 0),
			...r
		})),
		title: 'Weekly Movers Leaderboard',
		render: (u, username) =>
			`**${username}:** Gained ${u.count_increase} CL slots, from ${u.cl_completion_count} to ${u.cl_completion_count + u.count_increase
			}, and their global rank went from ${u.cl_global_rank - u.rank_difference} to ${u.cl_global_rank}`
	});
}

async function caLb(interaction: MInteraction) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
			`SELECT id::text as id, CARDINALITY(completed_ca_task_ids) AS qty
			 FROM users
			 WHERE CARDINALITY(completed_ca_task_ids) > 0
			 ORDER BY CARDINALITY(completed_ca_task_ids) DESC
			 LIMIT 50;`
		)
	).map(res => ({ id: res.id, score: Number(res.qty) }));
	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users,
		title: 'Combat Achievements Leaderboard',
		formatter: v => `${v.toLocaleString()} Tasks Completed`
	});
}

async function masteryLb(interaction: MInteraction) {
	const users = (
		await roboChimpClient.user.findMany({
			where: { [masteryKey]: { not: null } },
			orderBy: { [masteryKey]: 'desc' },
			take: 50,
			select: { id: true, osb_mastery: true, bso_mastery: true }
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
					autocomplete: async ({ value }: StringAutoComplete) => {
						return effectiveMonsters
							.filter(m => (!value ? true : m.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption,
				{
					type: 'Boolean',
					name: 'tame',
					description: 'Show tame kill counts',
					required: false
				}
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
			name: 'challenges',
			description: 'Check the BSO challenges won leaderboard.'
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
					autocomplete: async ({ value }: StringAutoComplete) => {
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
			type: 'Subcommand',
			name: 'hunter_catches',
			description: 'Check the hunter catch leaderboard.',
			options: [
				{
					type: 'String',
					name: 'creature',
					description: 'The particular creature you want to check.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
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
					autocomplete: async ({ value }: StringAutoComplete) => {
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
					autocomplete: async ({ value }: StringAutoComplete) => {
						return [
							{ name: 'Overall', value: 'overall' },
							...SkillsArray.map(i => ({ name: toTitleCase(i), value: i }))
						].filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
					}
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
					autocomplete: async ({ value }: StringAutoComplete) => {
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
					autocomplete: async ({ value }: StringAutoComplete) => {
						return [
							{ name: 'Overall (Main Leaderboard)', value: 'overall' },
							...['overall+', ...allClNames.map(i => i)].map(i => ({
								name: toTitleCase(i),
								value: i
							}))
						].filter(o => (!value ? true : o.name.toLowerCase().includes(value.toLowerCase())));
					}
				},
				ironmanOnlyOption,
				{
					type: 'Boolean',
					name: 'tames',
					description: 'If you want to view the tame CL leaderboard.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'item_contract_streak',
			description: 'The item contract streak leaderboard.',
			options: [ironmanOnlyOption]
		},
		{
			type: 'Subcommand',
			name: 'tames_hatched',
			description: 'Check the leaderboard for most tames hatched.',
			options: [ironmanOnlyOption]
		},
		{
			type: 'Subcommand',
			name: 'total_ic_donation_given',
			description: 'Total item contract donations given leaderboard.'
		},
		{
			type: 'Subcommand',
			name: 'unique_ic_donation_given',
			description: 'Unique item contract donations given leaderboard.'
		},
		{
			type: 'Subcommand',
			name: 'leagues',
			description: 'Check the Leagues leaderboards.',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'The leagues lb you want to select.',
					required: true,
					choices: choicesOf(['points', 'tasks', 'hardest_tasks'])
				}
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
			name: 'completion',
			description: 'Check the completion leaderboard.',
			options: [
				ironmanOnlyOption,
				{
					type: 'Boolean',
					name: 'untrimmed',
					description: 'Show only untrimmed completion.',
					required: false
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

		if (options.kc) {
			return kcLb(interaction, options.kc.monster, Boolean(options.kc.ironmen_only), Boolean(options.kc.tame));
		}

		if (options.farming_contracts) {
			return farmingContractLb(interaction, Boolean(options.farming_contracts.ironmen_only));
		}

		if (options.inferno) {
			return infernoLb(interaction);
		}

		if (options.sacrifice) {
			return sacrificeLb(interaction, options.sacrifice.type, Boolean(options.sacrifice.ironmen_only));
		}

		if (options.minigames) {
			return minigamesLb(interaction, options.minigames.minigame);
		}

		if (options.hunter_catches) {
			return creaturesLb(interaction, options.hunter_catches.creature);
		}

		if (options.agility_laps) {
			return lapsLb(interaction, options.agility_laps.course);
		}

		if (options.gp) {
			return gpLb(interaction, Boolean(options.gp.ironmen_only));
		}

		if (options.skills) {
			return skillsLb(
				interaction,
				options.skills.skill,
				options.skills.xp ? 'xp' : 'level',
				Boolean(options.skills.ironmen_only)
			);
		}

		if (options.opens) {
			return openLb(interaction, options.opens.openable, Boolean(options.opens.ironmen_only));
		}

		if (options.cl) {
			return clLb(interaction, options.cl.cl, Boolean(options.cl.ironmen_only), Boolean(options.cl.tames));
		}

		if (options.clues) {
			return cluesLb(interaction, options.clues.clue, Boolean(options.clues.ironmen_only));
		}

		if (options.movers) {
			return gainersLB(interaction, options.movers.type);
		}

		if (options.global) {
			return globalLb(interaction, options.global.type);
		}

		if (options.combat_achievements) {
			return caLb(interaction);
		}

		if (options.mastery) {
			return masteryLb(interaction);
		}

		return 'Invalid input.';
	}
});
