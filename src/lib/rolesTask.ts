import { Prisma } from '@prisma/client';
import { noOp, notEmpty } from 'e';

import { production, SupportServer } from '../config';
import { ClueTiers } from '../lib/clues/clueTiers';
import { Roles, usernameCache } from '../lib/constants';
import { getCollectionItems } from '../lib/data/Collections';
import { Minigames } from '../lib/settings/minigames';
import { prisma } from '../lib/settings/prisma';
import Skills from '../lib/skilling/skills';
import { convertXPtoLVL } from '../lib/util';
import { logError } from '../lib/util/logError';
import { TeamLoot } from './simulation/TeamLoot';
import { ItemBank } from './types';

function addToUserMap(userMap: Record<string, string[]>, id: string, reason: string) {
	if (!userMap[id]) userMap[id] = [];
	userMap[id].push(reason);
}

const minigames = Minigames.map(game => game.column).filter(i => i !== 'tithe_farm');

const collections = ['pets', 'skilling', 'clues', 'bosses', 'minigames', 'raids', 'slayer', 'other', 'custom'];

for (const cl of collections) {
	const items = getCollectionItems(cl);
	if (!items || items.length === 0) {
		throw new Error(`${cl} isn't a valid CL.`);
	}
}

const mostSlayerPointsQuery = `SELECT id, 'Most Points' as desc
FROM users
WHERE "slayer.points" > 50
ORDER BY "slayer.points" DESC
LIMIT 1;`;

const longerSlayerTaskStreakQuery = `SELECT user_id::text as id, 'Longest Task Streak' as desc
FROM user_stats
WHERE "slayer_task_streak" > 20
ORDER BY "slayer_task_streak" DESC
LIMIT 1;`;

const mostSlayerTasksDoneQuery = `SELECT user_id::text as id, 'Most Tasks' as desc
FROM slayer_tasks
GROUP BY user_id
ORDER BY count(user_id)::int DESC
LIMIT 1;`;

async function addRoles({
	users,
	role,
	badge,
	userMap
}: {
	users: string[];
	role: string;
	badge: number | null;
	userMap?: Record<string, string[]>;
}): Promise<string> {
	if (process.env.TEST) return '';
	const g = globalClient.guilds.cache.get(SupportServer);
	if (!g) throw new Error('No support guild');
	let added: string[] = [];
	let removed: string[] = [];
	let _role = await g.roles.fetch(role).catch(noOp);
	if (!_role) return `\nCould not check ${role} role`;
	for (const u of users.filter(notEmpty)) {
		await g.members.fetch(u).catch(noOp);
	}
	const roleName = _role.name!;
	let noChangeUserDescriptions: string[] = [];
	for (const mem of g.members.cache.values()) {
		const mUser = await mUserFetch(mem.user.id);
		if (mem.roles.cache.has(role) && !users.includes(mem.user.id)) {
			if (production) {
				await mem.roles.remove(role).catch(noOp);
			}

			if (badge && mUser.user.badges.includes(badge)) {
				await mUser.update({
					badges: mUser.user.badges.filter(i => i !== badge)
				});
			}
			removed.push(mem.user.username);
		}

		if (users.includes(mem.user.id)) {
			noChangeUserDescriptions.push(`${mem.user.username}`);
			if (production && !mem.roles.cache.has(role)) {
				added.push(mem.user.username);
				await mem.roles.add(role).catch(noOp);
			}
			if (badge && !mUser.user.badges.includes(badge)) {
				await mUser.update({
					badges: {
						push: badge
					}
				});
			}
		}
	}
	let str = `\n**${roleName}**`;
	if (added.length > 0) {
		str += `\nAdded to: ${added.join(', ')}.`;
	}
	if (removed.length > 0) {
		str += `\nRemoved from: ${removed.join(', ')}.`;
	}
	if (userMap) {
		let userArr = [];
		for (const [id, arr] of Object.entries(userMap)) {
			let username = usernameCache.get(id) ?? 'Unknown';
			userArr.push(`${username}(${arr.join(', ')})`);
		}
		str += `\n${userArr.join(',')}`;
	}
	if (added.length > 0 || removed.length > 0) {
		str += '\n';
	} else {
		return `**No Changes:** ${str}`;
	}
	return str;
}

export async function runRolesTask() {
	const skillVals = Object.values(Skills);

	let results: string[] = [];
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const q = async <T>(str: string) => {
		const result = await prisma.$queryRawUnsafe<T>(str).catch(err => {
			logError(`This query failed: ${str}`, err);
			return [];
		});
		return result;
	};

	// Top Skillers
	async function topSkillers() {
		const topSkillers = (
			await Promise.all([
				...skillVals.map(s =>
					q<
						{
							id: string;
							xp: string;
						}[]
					>(`SELECT id, "skills.${s.id}" as xp FROM users ORDER BY xp DESC LIMIT 1;`)
				),
				q<
					{
						id: string;
					}[]
				>(
					`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
						.map(s => `"skills.${s.id}"::bigint`)
						.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 1;`
				)
			])
		).map(i => i[0]?.id);

		// Rank 1 Total Level
		const rankOneTotal = (
			await q<any>(
				`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
					.map(s => `"skills.${s.id}"::bigint`)
					.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 200;`
			)
		)
			.map((u: any) => {
				let totalLevel = 0;
				for (const skill of skillVals) {
					totalLevel += convertXPtoLVL(Number(u[`skills.${skill.id}` as keyof any]) as any);
				}
				return {
					id: u.id,
					totalLevel
				};
			})
			.sort((a: any, b: any) => b.totalLevel - a.totalLevel)[0];
		topSkillers.push(rankOneTotal.id);

		results.push(await addRoles({ users: topSkillers, role: Roles.TopSkiller, badge: 9 }));
	}

	// Top Collectors
	async function topCollector() {
		const userMap = {};

		function generateQuery(items: number[], ironmenOnly: boolean, limit: number) {
			const t = `
SELECT id, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT ARRAY(SELECT * FROM JSONB_OBJECT_KEYS("collectionLogBank")) "cl_keys",
  				id, "collectionLogBank",
			    cardinality(ARRAY(SELECT * FROM JSONB_OBJECT_KEYS("collectionLogBank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
			FROM users
			WHERE "collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
			${ironmenOnly ? 'AND "minion.ironman" = true' : ''}
			) u
			ORDER BY qty DESC
			LIMIT ${limit};
`;

			return t;
		}

		const topCollectors = (
			await Promise.all(
				collections.map(async clName => {
					const items = getCollectionItems(clName);
					if (!items || items.length === 0) {
						logError(`${clName} collection log doesnt exist`);
						return [];
					}

					function handleErr(): any[] {
						logError(`Failed to select top collectors for ${clName}`);
						return [];
					}

					const [users, ironUsers] = await Promise.all([
						q<any>(generateQuery(items, false, 1))
							.then(i => i.filter((i: any) => i.qty > 0) as any[])
							.catch(handleErr),
						q<any>(generateQuery(items, true, 1))
							.then(i => i.filter((i: any) => i.qty > 0) as any[])
							.catch(handleErr)
					]);

					let result = [];
					const userID = users[0]?.id;
					const ironmanID = ironUsers[0]?.id;

					if (userID) {
						addToUserMap(userMap, userID, `Rank 1 ${clName} CL`);
						result.push(userID);
					}
					if (ironmanID) {
						addToUserMap(userMap, ironmanID, `Rank 1 Ironman ${clName} CL`);
						result.push(ironmanID);
					}

					return result;
				})
			)
		).flat(2);

		const topIronUsers = (await q<any>(generateQuery(getCollectionItems('overall'), true, 3))).filter(
			(i: any) => i.qty > 0
		) as any[];
		for (let i = 0; i < topIronUsers.length; i++) {
			const id = topIronUsers[i]?.id;
			addToUserMap(userMap, id, `Rank ${i + 1} Ironman Collector`);
			topCollectors.push(id);
		}
		const topNormieUsers = (await q<any>(generateQuery(getCollectionItems('overall'), false, 3))).filter(
			(i: any) => i.qty > 0
		) as any[];
		for (let i = 0; i < topNormieUsers.length; i++) {
			const id = topNormieUsers[i]?.id;
			addToUserMap(userMap, id, `Rank ${i + 1} Collector`);
			topCollectors.push(id);
		}

		results.push(await addRoles({ users: topCollectors, role: Roles.TopCollector, badge: 10, userMap }));
	}

	// Top sacrificers
	async function topSacrificers() {
		const userMap = {};
		let topSacrificers: string[] = [];
		const mostValue = await q<any[]>('SELECT id FROM users ORDER BY "sacrificedValue" DESC LIMIT 3;');
		for (let i = 0; i < 3; i++) {
			if (mostValue[i] !== undefined) {
				topSacrificers.push(mostValue[i].id);
				addToUserMap(userMap, mostValue[i].id, `Rank ${i + 1} Sacrifice Value`);
			}
		}
		const mostValueIronman = await q<any[]>(
			'SELECT id FROM users WHERE "minion.ironman" = true ORDER BY "sacrificedValue" DESC LIMIT 1;'
		);
		topSacrificers.push(mostValueIronman[0].id);
		addToUserMap(userMap, mostValueIronman[0].id, 'Rank 1 Ironman Sacrificed Value');

		const mostUniques = await q<any[]>(`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS("sacrificed_bank")) sacbanklength, user_id::text as id FROM user_stats
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`);

		const mostUniquesIron = await q<any[]>(`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*)::int FROM JSONB_OBJECT_KEYS("sacrificed_bank")) sacbanklength, user_id::text as id FROM user_stats
  INNER JOIN users ON "user_stats"."user_id"::text = "users"."id"
  WHERE "users"."minion.ironman" = true
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`);
		topSacrificers.push(mostUniques[0].id);
		addToUserMap(userMap, mostUniques[0].id, 'Most Uniques Sacrificed');
		topSacrificers.push(mostUniquesIron[0].id);
		addToUserMap(userMap, mostUniquesIron[0].id, 'Most Ironman Uniques Sacrificed');

		results.push(await addRoles({ users: topSacrificers, role: Roles.TopSacrificer, badge: 8, userMap }));
	}

	// Top minigamers
	async function topMinigamers() {
		let topMinigamers = (
			await Promise.all(
				minigames.map(m =>
					q(
						`SELECT user_id, '${m}' as m
FROM minigames
ORDER BY ${m} DESC
LIMIT 1;`
					)
				)
			)
		).map((i: any) => [i[0].user_id, Minigames.find(m => m.column === i[0].m)!.name]);

		let userMap = {};
		for (const [id, m] of topMinigamers) {
			addToUserMap(userMap, id, `Rank 1 ${m}`);
		}

		results.push(
			await addRoles({
				users: topMinigamers.map(i => i[0]),
				role: Roles.TopMinigamer,
				badge: 11,
				userMap
			})
		);
	}

	// Top clue hunters
	async function topClueHunters() {
		let topClueHunters = (
			await Promise.all(
				ClueTiers.map(t =>
					q(
						`SELECT id, '${t.name}' as n, (openable_scores->>'${t.id}')::int as qty
FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "openable_scores"->>'${t.id}' IS NOT NULL
ORDER BY qty DESC
LIMIT 1;`
					)
				)
			)
		)
			.filter((i: any) => Boolean(i[0]?.id))
			.map((i: any) => [i[0]?.id, i[0]?.n]);

		let userMap = {};

		for (const [id, n] of topClueHunters) {
			addToUserMap(userMap, id, `Rank 1 ${n} Clues`);
		}

		results.push(
			await addRoles({
				users: topClueHunters.map(i => i[0]),
				role: Roles.TopClueHunter,
				badge: null,
				userMap
			})
		);
	}

	// Top farmers
	async function farmers() {
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
		let res = (await Promise.all(queries.map(q))).map((i: any) => [i[0]?.id, i[0]?.desc]);
		let userMap = {};
		for (const [id, desc] of res) {
			addToUserMap(userMap, id, desc);
		}

		results.push(
			await addRoles({
				users: res.map(i => i[0]),
				role: '894194027363205150',
				badge: null,
				userMap
			})
		);
	}

	// Top slayers
	async function slayer() {
		let topSlayers = (
			await Promise.all(
				[mostSlayerPointsQuery, longerSlayerTaskStreakQuery, mostSlayerTasksDoneQuery].map(query => q(query))
			)
		)
			.filter((i: any) => Boolean(i[0]?.id))
			.map((i: any) => [i[0]?.id, i[0]?.desc]);

		let userMap = {};
		for (const [id, desc] of topSlayers) {
			addToUserMap(userMap, id, desc);
		}

		results.push(
			await addRoles({
				users: topSlayers.map(i => i[0]),
				role: Roles.TopSlayer,
				badge: null,
				userMap
			})
		);
	}

	// Top giveawayers
	async function giveaways() {
		const GIVEAWAY_CHANNELS = [
			'792691343284764693',
			'732207379818479756',
			'342983479501389826',
			'982989775399174184',
			'346304390858145792'
		];
		const res = await prisma.$queryRaw<
			{ user_id: string; qty: number }[]
		>`SELECT user_id, COUNT(user_id)::int AS qty
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
		for (const giveaway of giveaways) {
			giveawayBank.add(giveaway.user_id, giveaway.loot as ItemBank);
		}

		let userMap = {};
		const [[highestID, loot]] = giveawayBank.entries().sort((a, b) => b[1].value() - a[1].value());
		addToUserMap(userMap, highestID, `Most Value Given Away (${loot.value()})`);

		results.push(
			await addRoles({
				users: [highestID],
				role: '1052481561603346442',
				badge: null,
				userMap
			})
		);
	}

	// Global CL %
	async function globalCL() {
		const result = await roboChimpClient.$queryRaw<
			{ id: string; total_cl_percent: number }[]
		>`SELECT ((osb_cl_percent + bso_cl_percent) / 2) AS total_cl_percent, id::text AS id
FROM public.user
WHERE osb_cl_percent IS NOT NULL AND bso_cl_percent IS NOT NULL
ORDER BY total_cl_percent DESC
LIMIT 10;`;

		results.push(
			await addRoles({
				users: result.slice(0, 10).map(i => i.id),
				role: Roles.TopGlobalCL,
				badge: null
			})
		);
	}

	const tup = [
		['Top Slayer', slayer],
		['Top Clue Hunters', topClueHunters],
		['Top Minigamers', topMinigamers],
		['Top Sacrificers', topSacrificers],
		['Top Collectors', topCollector],
		['Top Skillers', topSkillers],
		['Top Farmers', farmers],
		['Top Giveawayers', giveaways],
		['Global CL', globalCL]
	] as const;

	let failed: string[] = [];
	await Promise.all(
		tup.map(async ([name, fn]) => {
			try {
				await fn();
			} catch (err: any) {
				if (process.env.TEST) {
					throw err;
				}
				failed.push(`${name} (${err.message})`);
				logError(err);
			}
		})
	);

	let res = `**Roles**
${results.join('\n')}
${failed.length > 0 ? `Failed: ${failed.join(', ')}` : ''}`;

	return res;
}
