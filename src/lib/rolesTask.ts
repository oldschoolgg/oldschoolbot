import { noOp, uniqueArr } from 'e';

import { SupportServer } from '../config';
import { BadgesEnum, Roles } from '../lib/constants';
import { getCollectionItems, overallPlusItems } from '../lib/data/Collections';
import { Minigames } from '../lib/settings/minigames';

import { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';
import PQueue from 'p-queue';
import { partition } from 'remeda';
import z from 'zod';
import {
	type CommandResponse,
	Stopwatch,
	convertXPtoLVL,
	getUsernameSync,
	resolveItems,
	returnStringOrFile
} from '../lib/util';
import { ClueTiers } from './clues/clueTiers';
import { RawSQL } from './rawSql';
import { TeamLoot } from './simulation/TeamLoot';
import { SkillsArray } from './skilling/types';
import type { ItemBank } from './types';
import { fetchMultipleCLLeaderboards, fetchTameCLLeaderboard } from './util/clLeaderboard';
import { logError } from './util/logError';

const RoleResultSchema = z.object({
	roleID: z.string().min(17).max(19),
	userID: z.string().min(17).max(19),
	reason: z.string(),
	badge: z.number().int().optional()
});
type RoleResult = z.infer<typeof RoleResultSchema>;

const minigames = Minigames.map(game => game.column).filter(i => i !== 'tithe_farm');

const CLS_THAT_GET_ROLE = ['skilling', 'clues', 'minigames', 'other', 'overall'];

for (const cl of CLS_THAT_GET_ROLE) {
	const items = getCollectionItems(cl);
	if (!items || items.length === 0) {
		throw new Error(`${cl} isn't a valid CL.`);
	}
}

async function topSkillers() {
	const results: RoleResult[] = [];

	const [top200TotalXPUsers, ...top200ms] = await prisma.$transaction([
		prisma.$queryRawUnsafe<any>(
			`SELECT id, ${SkillsArray.map(s => `"skills.${s}"`)}, ${SkillsArray.map(s => `"skills.${s}"::bigint`).join(
				' + '
			)} as totalxp FROM users ORDER BY totalxp DESC LIMIT 200;`
		),
		...SkillsArray.map(s => {
			const query = `SELECT id, "skills.${s}" AS xp, '${s}' AS skill FROM users ORDER BY xp DESC LIMIT 1;`;
			return prisma.$queryRawUnsafe<{
				id: string;
				xp: string;
				skill: string;
			}>(query);
		})
	]);

	for (const { id, skill } of top200ms.flat()) {
		results.push({
			userID: id,
			roleID: Roles.TopSkiller,
			reason: `Rank 1 ${skill} XP`,
			badge: BadgesEnum.TopSkiller
		});
	}

	const rankOneTotal = top200TotalXPUsers
		.map((u: any) => {
			let totalLevel = 0;
			for (const skill of SkillsArray) {
				totalLevel += convertXPtoLVL(Number(u[`skills.${skill}` as keyof any]) as any);
			}
			return {
				id: u.id,
				totalLevel
			};
		})
		.sort((a: any, b: any) => b.totalLevel - a.totalLevel)[0];

	results.push({
		userID: rankOneTotal.id,
		roleID: Roles.TopSkiller,
		reason: 'Rank 1 Total Level',
		badge: BadgesEnum.TopSkiller
	});

	return results;
}

async function topCollector() {
	const results: RoleResult[] = [];
	const rankOneInSpecifiedCLs = await fetchMultipleCLLeaderboards(
		CLS_THAT_GET_ROLE.map(cl => {
			const items = getCollectionItems(cl);
			const base = {
				items,
				clName: cl,
				resultLimit: cl === 'overall' ? 3 : 1
			} as const;
			return [
				{ ...base, ironmenOnly: true },
				{ ...base, ironmenOnly: false }
			];
		}).flat(2)
	);
	for (const { users, clName, ironmenOnly } of rankOneInSpecifiedCLs) {
		for (const user of users) {
			results.push({
				userID: user.id,
				roleID: Roles.TopCollector,
				reason: `Rank 1 ${ironmenOnly ? 'Iron' : 'Main'} ${clName}`,
				badge: BadgesEnum.TopCollector
			});
		}
	}
	return results;
}

async function topSacrificers() {
	const results: RoleResult[] = [];
	const users = await prisma.$transaction([
		prisma.$queryRawUnsafe<{ id: string; reason: string }[]>(
			`SELECT id, 'Top 3' AS reason FROM users ORDER BY "sacrificedValue" DESC LIMIT 3;`
		),
		prisma.$queryRawUnsafe<{ id: string; reason: string }[]>(
			`SELECT id, 'Top Ironman' AS reason FROM users WHERE "minion.ironman" = true ORDER BY "sacrificedValue" DESC LIMIT 1;`
		),
		prisma.$queryRawUnsafe<{ id: string; reason: string }[]>(`SELECT u.id, 'Top Uniques' AS reason FROM (
  SELECT (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS("sacrificed_bank")) sacbanklength, user_id::text as id FROM user_stats
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`),
		prisma.$queryRawUnsafe<{ id: string; reason: string }[]>(`SELECT u.id, 'Top Ironman Uniques' AS reason FROM (
  SELECT (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS("sacrificed_bank")) sacbanklength, user_id::text as id FROM user_stats
  INNER JOIN users ON "user_stats"."user_id"::text = "users"."id"
  WHERE "users"."minion.ironman" = true
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`)
	]);

	for (const res of users.flat()) {
		results.push({
			userID: res.id,
			reason: res.reason,
			roleID: Roles.TopSacrificer,
			badge: BadgesEnum.TopSacrifice
		});
	}

	return results;
}

async function topMinigamers() {
	const results: RoleResult[] = [];
	const topMinigamers = await prisma.$transaction(
		minigames.map(m =>
			prisma.$queryRawUnsafe<{ id: string; minigame_name: string; qty: number }[]>(
				`SELECT user_id::text AS id, '${m}' AS minigame_name
FROM minigames
ORDER BY ${m} DESC
LIMIT 1;`
			)
		)
	);

	for (const { id, minigame_name } of topMinigamers.flat()) {
		results.push({
			userID: id,
			roleID: Roles.TopMinigamer,
			reason: `Rank 1 ${minigame_name}`,
			badge: BadgesEnum.TopMinigame
		});
	}

	return results;
}

async function topClueHunters() {
	const results: RoleResult[] = [];
	const topClueHunters = await prisma.$transaction(
		ClueTiers.map(t =>
			prisma.$queryRawUnsafe<{ user_id: string; tier_name: string; qty: string }>(
				`
SELECT user_id::text, '${t.name}' AS tier_name, (openable_scores->>'${t.id}')::int AS qty
FROM user_stats
WHERE "openable_scores"->>'${t.id}' IS NOT NULL
ORDER BY qty DESC
LIMIT 1;`
			)
		)
	);

	for (const res of topClueHunters.flat()) {
		results.push({
			userID: res.user_id,
			roleID: Roles.TopClueHunter,
			reason: `Rank 1 ${res.tier_name} Clues`,
			badge: BadgesEnum.TopMinigame
		});
	}
	return results;
}

async function topFarmers() {
	const results: RoleResult[] = [];
	const queries = [
		`SELECT id, 'Top 2 Farming Contracts' as desc
FROM users
WHERE "minion.farmingContract" IS NOT NULL
AND "minion.ironman" = true
ORDER BY ("minion.farmingContract"->>'contractsCompleted')::int DESC
LIMIT 2;`,
		`SELECT id, 'Top 2 Ironman Farming Contracts' as desc
FROM users
WHERE "minion.farmingContract" IS NOT NULL
ORDER BY ("minion.farmingContract"->>'contractsCompleted')::int DESC
LIMIT 2;`,
		`SELECT user_id::text as id, 'Top 2 Most Farming Trips' as desc
FROM activity
WHERE type = 'Farming'
GROUP BY user_id
ORDER BY count(user_id)::int DESC
LIMIT 2;`,
		`SELECT user_id::text as id, 'Top 2 Tithe Farm' as desc
FROM user_stats
ORDER BY "tithe_farms_completed" DESC
LIMIT 2;`
	];
	const res = await prisma.$transaction(queries.map(q => prisma.$queryRawUnsafe<{ id: string; desc: string }[]>(q)));
	for (const { id, desc } of res.flat()) {
		results.push({
			userID: id,
			roleID: '894194027363205150',
			reason: desc,
			badge: BadgesEnum.Slayer
		});
	}
	return results;
}

async function fetchSlayerResults() {
	const results: RoleResult[] = [];
	const topSlayers = await prisma.$transaction([
		prisma.$queryRawUnsafe<{ id: string; desc: string }[]>(`SELECT id, 'Most Points' as desc
FROM users
WHERE "slayer.points" > 50
ORDER BY "slayer.points" DESC
LIMIT 1;`),
		prisma.$queryRawUnsafe<{ id: string; desc: string }[]>(`SELECT user_id::text as id, 'Longest Task Streak' as desc
FROM user_stats
WHERE "slayer_task_streak" > 20
ORDER BY "slayer_task_streak" DESC
LIMIT 1;`),
		prisma.$queryRawUnsafe<{ id: string; desc: string }[]>(`SELECT user_id::text as id, 'Most Tasks' as desc
FROM slayer_tasks
GROUP BY user_id
ORDER BY count(user_id)::int DESC
LIMIT 1;`)
	]);

	for (const { id, desc } of topSlayers.flat()) {
		results.push({
			userID: id,
			roleID: Roles.TopSlayer,
			reason: desc,
			badge: BadgesEnum.Slayer
		});
	}
	return results;
}

async function giveaways() {
	const results: RoleResult[] = [];
	const GIVEAWAY_CHANNELS = [
		'792691343284764693',
		'732207379818479756',
		'342983479501389826',
		'982989775399174184',
		'346304390858145792'
	];
	const res = await prisma.$queryRaw<{ user_id: string; qty: number }[]>`SELECT user_id, COUNT(user_id)::int AS qty
	FROM giveaway
	WHERE channel_id IN (${Prisma.join(GIVEAWAY_CHANNELS)})
	AND user_id NOT IN ('157797566833098752')
	GROUP BY user_id
	ORDER BY qty DESC
	LIMIT 50;`;
	const userIDsToCheck = res.map(i => i.user_id);

	const giveawayBank = new TeamLoot();

	const giveaways = await prisma.giveaway.findMany({
		where: {
			channel_id: {
				in: GIVEAWAY_CHANNELS
			},
			user_id: {
				in: userIDsToCheck
			}
		}
	});

	if (giveaways.length === 0) return results;

	for (const giveaway of giveaways) {
		giveawayBank.add(giveaway.user_id, giveaway.loot as ItemBank);
	}

	const [[highestID, loot]] = giveawayBank.entries().sort((a, b) => b[1].value() - a[1].value());

	results.push({
		userID: highestID,
		roleID: '1104155653745946746',
		reason: `Most Value Given Away (${loot.value()})`,
		badge: BadgesEnum.TopGiveawayer
	});
	return results;
}

async function globalCL() {
	const results: RoleResult[] = [];
	const result = await roboChimpClient.$queryRaw<{ id: string; total_cl_percent: number }[]>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
	FROM public.user
	WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
	ORDER BY total_cl_percent DESC
	LIMIT 10;`;

	for (const user of result) {
		results.push({
			userID: user.id,
			roleID: Roles.TopGlobalCL,
			reason: `Top Global CL ${user.total_cl_percent}%`,
			badge: BadgesEnum.TopCollector
		});
	}
	return results;
}

async function topLeagues() {
	const [topPoints, topTasks] = await prisma.$transaction([
		roboChimpClient.user.findMany({
			where: {
				leagues_points_total: {
					gt: 0
				}
			},
			orderBy: {
				leagues_points_total: 'desc'
			},
			take: 2
		}),
		RawSQL.leaguesTaskLeaderboard()
	]);

	const results: RoleResult[] = [];
	for (const userID of [topPoints, topTasks].flat().map(i => i.id.toString())) {
		results.push({
			userID: userID,
			roleID: Roles.TopLeagues,
			reason: 'Top 2 leagues points/points'
		});
	}
	return results;
}

async function topTamer(): Promise<RoleResult[]> {
	const [rankOne] = await fetchTameCLLeaderboard({ items: overallPlusItems, resultLimit: 1 });
	if (rankOne) {
		return [
			{
				userID: rankOne.user_id,
				roleID: Roles.TopTamer,
				reason: 'Rank 1 Tames CL'
			}
		];
	}
	return [];
}

async function topMysterious(): Promise<RoleResult[]> {
	const items = resolveItems([
		'Pet mystery box',
		'Holiday mystery box',
		'Equippable mystery box',
		'Clothing mystery box',
		'Tradeable mystery box',
		'Untradeable mystery box'
	]);
	const res = await Promise.all(items.map(id => RawSQL.openablesLeaderboard(id)));

	const userScoreMap: Record<string, number> = {};
	for (const lb of res) {
		const [rankOne] = lb;
		for (const user of lb) {
			if (!userScoreMap[user.id]) userScoreMap[user.id] = 0;
			userScoreMap[user.id] += user.score / rankOne.score;
		}
	}

	const entries = Object.entries(userScoreMap).sort((a, b) => b[1] - a[1]);
	const [[rankOneID]] = entries;

	return [
		{
			userID: rankOneID,
			roleID: Roles.TopMysterious,
			reason: 'Rank 1 Mystery Box Opens'
		}
	];
}

async function monkeyKing(): Promise<RoleResult[]> {
	const [user] = await RawSQL.monkeysFoughtLeaderboard();
	return [{ userID: user.id, roleID: '886180040465870918', reason: 'Most Monkeys Fought' }];
}

async function topInventor(): Promise<RoleResult[]> {
	const mostUniquesLb = await RawSQL.inventionDisassemblyLeaderboard();
	const topInventors: string[] = [mostUniquesLb[0].id];
	const parsed = mostUniquesLb
		.map(i => ({ ...i, value: new Bank(i.disassembled_items_bank).value() }))
		.sort((a, b) => b.value - a.value);
	topInventors.push(parsed[0].id);
	return topInventors.map(i => ({ userID: i, roleID: Roles.TopInventor, reason: 'Most Uniques/Value Disassembled' }));
}

export async function runRolesTask(dryRun: boolean): Promise<CommandResponse> {
	const results: RoleResult[] = [];

	const promiseQueue = new PQueue({ concurrency: 2 });

	const tup = [
		['Top Slayer', fetchSlayerResults],
		['Top Clue Hunters', topClueHunters],
		['Top Minigamers', topMinigamers],
		['Top Sacrificers', topSacrificers],
		['Top Collectors', topCollector],
		['Top Skillers', topSkillers],
		['Top Farmers', topFarmers],
		['Top Giveawayers', giveaways],
		['Global CL', globalCL],

		// BSO Only
		['Top Leagues', topLeagues],
		['Top Tamer', topTamer],
		['Top Mysterious', topMysterious],
		['Monkey King', monkeyKing],
		['Top Inventor', topInventor]
	] as const;

	for (const [name, fn] of tup) {
		promiseQueue.add(async () => {
			const stopwatch = new Stopwatch();
			try {
				const res = await fn();
				const [validResults, invalidResults] = partition(res, i => RoleResultSchema.safeParse(i).success);
				results.push(...validResults);
				if (invalidResults.length > 0) {
					logError(`[RolesTask] Invalid results for ${name}: ${JSON.stringify(invalidResults)}`);
				}
			} catch (err) {
				logError(`[RolesTask] Error in ${name}: ${err}`);
			} finally {
				debugLog(`[RolesTask] Ran ${name} in ${stopwatch.stop()}`);
			}
		});
	}

	await promiseQueue.onIdle();

	debugLog(`Finished role functions, ${results.length} results`);

	const allBadgeIDs = uniqueArr(results.map(i => i.badge));
	const allRoleIDs = uniqueArr(results.map(i => i.roleID));

	if (!dryRun) {
		const roleNames = new Map<string, string>();
		const supportServerGuild = globalClient.guilds.cache.get(SupportServer)!;
		if (!supportServerGuild) throw new Error('No support guild');

		// Remove all top badges from all users (and add back later)
		debugLog('Removing badges...');
		const badgeIDs = `ARRAY[${allBadgeIDs.join(',')}]`;
		await prisma.$queryRawUnsafe(`
UPDATE users
SET badges = badges - ${badgeIDs}
WHERE badges && ${badgeIDs}
`);

		// Remove roles from ineligible users
		debugLog('Remove roles from ineligible users...');
		for (const member of supportServerGuild.members.cache.values()) {
			const rolesToRemove = member.roles.cache.filter(r => allRoleIDs.includes(r.id));
			if (rolesToRemove.size > 0) {
				await member.roles.remove(rolesToRemove.map(r => r.id)).catch(console.error);
			}
		}

		// Add roles to users
		debugLog('Add roles to users...');
		for (const { userID, roleID, badge } of results) {
			if (!userID) continue;
			const role = await supportServerGuild.roles.fetch(roleID).catch(console.error);
			const member = await supportServerGuild.members.fetch(userID).catch(noOp);
			if (!member) {
				debugLog(`Failed to find member ${userID}`);
				continue;
			}
			if (!role) {
				debugLog(`Failed to find role ${roleID}`);
				continue;
			}
			roleNames.set(roleID, role.name);

			if (!member.roles.cache.has(roleID)) {
				await member.roles.add(roleID).catch(console.error);
			}

			if (badge) {
				const user = await mUserFetch(userID);
				if (!user.user.badges.includes(badge)) {
					await user.update({
						badges: {
							push: badge
						}
					});
				}
			}
		}

		return returnStringOrFile(
			`**Roles**\n${results.map(r => `${getUsernameSync(r.userID)} got ${roleNames.get(r.roleID)} because ${r.reason}`).join('\n')}`
		);
	}

	return 'Dry run';
}
