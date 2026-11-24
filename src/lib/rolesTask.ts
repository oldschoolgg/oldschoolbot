import { notEmpty, Stopwatch, uniqueArr } from '@oldschoolgg/toolkit';
import { convertXPtoLVL, type ItemBank } from 'oldschooljs';
import PQueue from 'p-queue';
import { partition } from 'remeda';
import * as z from 'zod';

import { Prisma } from '@/prisma/main.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { BadgesEnum, globalConfig, MAX_LEVEL, Roles } from '@/lib/constants.js';
import { getCollectionItems } from '@/lib/data/Collections.js';
import { getManagedRoleMembers, managedRoles } from '@/lib/managedRoles.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';
import { type SkillNameType, SkillsArray } from '@/lib/skilling/types.js';
import { fetchMultipleCLLeaderboards } from '@/lib/util/clLeaderboard.js';

const RoleResultSchema = z.object({
	roleID: z.string().min(17).max(19),
	userID: z.string().min(17).max(19),
	reason: z.string(),
	badge: z.number().int().optional()
});
type RoleResult = z.infer<typeof RoleResultSchema>;

const minigames = Minigames.map(game => game.column).filter(i => i !== 'tithe_farm');

const CLS_THAT_GET_ROLE = [
	'pets',
	'skilling',
	'clues',
	'bosses',
	'minigames',
	'raids',
	'slayer',
	'other',
	'custom',
	'overall',
	'creatables'
];

for (const cl of CLS_THAT_GET_ROLE) {
	const items = getCollectionItems(cl);
	if (!items || items.size === 0) {
		throw new Error(`${cl} isn't a valid CL.`);
	}
}

async function topSkillers() {
	const results: RoleResult[] = [];

	const [top200TotalXPUsers, ...top200ms] = await prisma.$transaction([
		prisma.$queryRawUnsafe<({ id: string; totalxp: bigint } & Record<`skills.${SkillNameType}`, bigint>)[]>(
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
			roleID: Roles.OSBTopSkiller,
			reason: `Rank 1 ${skill} XP`,
			badge: BadgesEnum.TopSkiller
		});
	}

	const rankOneTotal = top200TotalXPUsers
		.map(u => {
			let totalLevel = 0;
			for (const skill of SkillsArray) {
				totalLevel += convertXPtoLVL(Number(u[`skills.${skill}`]), MAX_LEVEL);
			}
			return {
				id: u.id,
				totalLevel
			};
		})
		.sort((a, b) => b.totalLevel - a.totalLevel)[0];

	results.push({
		userID: rankOneTotal.id,
		roleID: Roles.OSBTopSkiller,
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
				roleID: Roles.OSBTopCollector,
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
			roleID: Roles.OSBTopSacrificer,
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
			roleID: Roles.OSBTopMinigamer,
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
			roleID: Roles.OSBTopClueHunter,
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
			roleID: Roles.OSBTopFarmer,
			reason: desc,
			badge: BadgesEnum.Farmer
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
		prisma.$queryRawUnsafe<
			{ id: string; desc: string }[]
		>(`SELECT user_id::text as id, 'Longest Task Streak' as desc
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
			roleID: Roles.OSBTopSlayer,
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
		roleID: '1052481561603346442',
		reason: `Most Value Given Away (${loot.value()})`,
		badge: BadgesEnum.TopGiveawayer
	});
	return results;
}

async function globalCL() {
	const results: RoleResult[] = [];
	const result = await roboChimpClient.$queryRaw<
		{ id: string; total_cl_percent: number }[]
	>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
	FROM public.user
	WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
	ORDER BY total_cl_percent DESC
	LIMIT 10;`;

	for (const user of result) {
		results.push({
			userID: user.id,
			roleID: Roles.OSBTopGlobalCL,
			reason: `Top Global CL ${user.total_cl_percent}%`,
			badge: BadgesEnum.TopCollector
		});
	}
	return results;
}

export async function runRolesTask(dryRun: boolean): Promise<CommandResponse> {
	const results: RoleResult[] = [];
	const debugMessages: string[] = [];
	let failed = false;

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
		['Global CL', globalCL]
	] as const;

	for (const [name, fn] of tup) {
		promiseQueue.add(async () => {
			const stopwatch = new Stopwatch();
			try {
				const res = await fn();
				const [validResults, invalidResults] = partition(res, i => RoleResultSchema.safeParse(i).success);
				results.push(...validResults);
				if (invalidResults.length > 0) {
					failed = true;
					Logging.logError(`[RolesTask] Invalid results for ${name}: ${JSON.stringify(invalidResults)}`);
					debugMessages.push(`The ${name} roles had invalid results.`);
				}
			} catch (err) {
				failed = true;
				debugMessages.push(`The ${name} roles errored.`);
				Logging.logError(`[RolesTask] Error in ${name}: ${err}`);
			} finally {
				Logging.logDebug(`[RolesTask] Ran ${name} in ${stopwatch.stop()}`);
			}
		});
	}

	await promiseQueue.onIdle();

	debugMessages.push(`Finished role functions, ${results.length} results`);

	const report = [
		'Role entitlements',
		...managedRoles.map(role => {
			const members = results.filter(result => result.roleID === role);
			return `<@&${role}>: ${members.length ? members.map(result => `<@${result.userID}> (${result.reason})`).join(', ') : 'No eligible users'}`;
		}),
		'',
		...debugMessages
	].join(String.fromCharCode(10));
	if (dryRun) return `Dry run: ${report}`;
	if (failed)
		return `Role sync aborted because entitlement calculations failed.
${report}`;

	const guildId = globalConfig.supportServerID;
	const current = await getManagedRoleMembers();
	const desired = new Map(managedRoles.map(role => [role, new Set<string>()]));
	for (const result of results) {
		const members = desired.get(result.roleID);
		if (!members) throw new Error(`Unregistered managed role ${result.roleID}`);
		members.add(result.userID);
	}
	for (const [role, members] of current) {
		for (const userId of members) {
			if (desired.get(role)!.has(userId)) continue;
			try {
				await globalClient.takeRole(guildId, userId, role);
				await Cache.updateManagedRole(guildId, role, userId, false);
				await Cache.clearMember(guildId, userId);
				debugMessages.push(`Removed <@&${role}> from <@${userId}>`);
			} catch (err) {
				Logging.logError(err as Error);
				debugMessages.push(`Failed to remove <@&${role}> from <@${userId}>`);
			}
		}
	}
	for (const [role, members] of desired) {
		for (const userId of members) {
			if (current.get(role)!.has(userId)) continue;
			try {
				await globalClient.giveRole(guildId, userId, role);
				await Cache.updateManagedRole(guildId, role, userId, true);
				await Cache.clearMember(guildId, userId);
				debugMessages.push(`Added <@&${role}> to <@${userId}>`);
			} catch (err) {
				Logging.logError(err as Error);
				debugMessages.push(`Failed to add <@&${role}> to <@${userId}>`);
			}
		}
	}
	const allBadgeIDs = uniqueArr(results.map(i => i.badge)).filter(notEmpty);
	if (allBadgeIDs.length) {
		const badgeIDs = `ARRAY[${allBadgeIDs.join(',')}]`;
		await prisma.$queryRawUnsafe(`UPDATE users SET badges = badges - ${badgeIDs} WHERE badges && ${badgeIDs}`);
	}
	const badgesByUser = new Map<string, Set<number>>();
	for (const { userID, badge } of results) {
		if (!badge) continue;
		if (!badgesByUser.has(userID)) badgesByUser.set(userID, new Set());
		badgesByUser.get(userID)!.add(badge);
	}
	for (const [userId, badges] of badgesByUser) {
		const user = await mUserFetch(userId);
		await user.update({ badges: { push: [...badges] } });
	}
	return [report, '', 'Sync:', ...debugMessages].join(String.fromCharCode(10));
}
