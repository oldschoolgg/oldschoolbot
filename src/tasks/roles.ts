import { Guild } from 'discord.js';
import { noOp } from 'e';
import { Task } from 'klasa';

import { CLUser, SkillUser } from '../commands/Minion/leaderboard';
import { production } from '../config';
import { Minigames } from '../extendables/User/Minigame';
import { Roles, SupportServer } from '../lib/constants';
import { getCollectionItems } from '../lib/data/Collections';
import ClueTiers from '../lib/minions/data/clueTiers';
import { UserSettings } from '../lib/settings/types/UserSettings';
import Skills from '../lib/skilling/skills';
import { convertXPtoLVL } from '../lib/util';

function addToUserMap(userMap: Record<string, string[]>, id: string, reason: string) {
	if (!userMap[id]) userMap[id] = [];
	userMap[id].push(reason);
}

const minigames = Minigames.map(game => game.column);

const collections = [
	'overall',
	'rolepets',
	'skilling',
	'clues',
	'bosses',
	'minigames',
	'raids',
	'slayer',
	'Dyed Items',
	'other',
	'custom'
];

const mostSlayerPointsQuery = `SELECT id, 'Most Points' as desc
FROM users
WHERE "slayer.points" > 50
ORDER BY "slayer.points" DESC
LIMIT 1;`;

const longerSlayerTaskStreakQuery = `SELECT id, 'Longest Task Streak' as desc
FROM users
WHERE "slayer.task_streak" > 20
ORDER BY "slayer.task_streak" DESC
LIMIT 1;`;

const mostSlayerTasksDoneQuery = `SELECT user_id as id, 'Most Tasks' as desc
FROM slayer_tasks
GROUP BY user_id
ORDER BY count(user_id) DESC
LIMIT 1;`;

async function addRoles({
	g,
	users,
	role,
	badge,
	userMap
}: {
	g: Guild;
	users: string[];
	role: string;
	badge: number | null;
	userMap?: Record<string, string[]>;
}): Promise<string> {
	let added: string[] = [];
	let removed: string[] = [];
	let _role = await g.roles.fetch(role);
	if (!_role) return 'Could not check role';
	for (const u of users) {
		await g.members.fetch(u);
	}
	const roleName = _role.name!;
	for (const mem of g.members.cache.values()) {
		if (mem.roles.cache.has(role) && !users.includes(mem.user.id)) {
			if (production) {
				await mem.roles.remove(role).catch(noOp);
			}
			if (badge && mem.user.settings.get(UserSettings.Badges).includes(badge)) {
				await mem.user.settings.sync(true);
				await mem.user.settings
					.update(UserSettings.Badges, badge, {
						arrayAction: 'remove'
					})
					.catch(noOp);
			}
			removed.push(mem.user.username);
		}

		if (users.includes(mem.user.id)) {
			if (production && !mem.roles.cache.has(role)) {
				added.push(mem.user.username);
				await mem.roles.add(role).catch(noOp);
			}
			if (badge && !mem.user.settings.get(UserSettings.Badges).includes(badge)) {
				await mem.user.settings.sync(true);
				await mem.user.settings
					.update(UserSettings.Badges, badge, {
						arrayAction: 'add'
					})
					.catch(noOp);
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
			let username = (g.client.commands.get('leaderboard') as any)!.getUsername(id);
			userArr.push(`${username}(${arr.join(', ')})`);
		}
		str += `\n${userArr.join(',')}`;
	}
	if (added.length || removed.length) {
		str += '\n';
	} else {
		return `\nNo changes for **${roleName}**`;
	}
	return str;
}

export default class extends Task {
	async run() {
		const g = this.client.guilds.cache.get(SupportServer);
		if (!g) return;
		const skillVals = Object.values(Skills);

		let result = '';
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const q = async <T>(str: string) => {
			const result = await this.client.query<T>(str).catch(err => {
				console.error(`This query failed: ${str}`, err);
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
				await q<SkillUser[]>(
					`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
						.map(s => `"skills.${s.id}"::bigint`)
						.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 200;`
				)
			)
				.map(u => {
					let totalLevel = 0;
					for (const skill of skillVals) {
						totalLevel += convertXPtoLVL(Number(u[`skills.${skill.id}` as keyof SkillUser]) as any);
					}
					return {
						id: u.id,
						totalLevel
					};
				})
				.sort((a, b) => b.totalLevel - a.totalLevel)[0];
			topSkillers.push(rankOneTotal.id);

			result += await addRoles({ g: g!, users: topSkillers, role: Roles.TopSkiller, badge: 9 });
		}

		// Top Collectors
		async function topCollector() {
			const userMap = {};
			const topCollectors = await Promise.all(
				collections.map(async clName => {
					const items = getCollectionItems(clName);
					if (!items) {
						console.error(`${clName} collection log doesnt exist`);
					}
					const users = (
						await q<any>(
							`
SELECT id, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT ARRAY(SELECT * FROM JSONB_OBJECT_KEYS("collectionLogBank")) "cl_keys",
  				id, "collectionLogBank",
			    cardinality(ARRAY(SELECT * FROM JSONB_OBJECT_KEYS("collectionLogBank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
			FROM users
			WHERE "collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
			) u
			ORDER BY qty DESC
			LIMIT 1;
`
						)
					).filter((i: any) => i.qty > 0) as CLUser[];
					addToUserMap(userMap, users?.[0]?.id, `Rank 1 ${clName} CL`);
					return users?.[0]?.id;
				})
			);

			result += await addRoles({ g: g!, users: topCollectors, role: Roles.TopCollector, badge: 10, userMap });
		}

		// Top sacrificers
		async function topSacrificers() {
			const userMap = {};
			let topSacrificers: string[] = [];
			const mostValue = await q<SkillUser[]>('SELECT id FROM users ORDER BY "sacrificedValue" DESC LIMIT 3;');
			for (let i = 0; i < 3; i++) {
				topSacrificers.push(mostValue[i].id);
				addToUserMap(userMap, mostValue[i].id, `Rank ${i + 1} Sacrifice Value`);
			}
			const mostUniques = await q<SkillUser[]>(`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("sacrificedBank")) sacbanklength, id FROM users
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`);
			topSacrificers.push(mostUniques[0].id);
			addToUserMap(userMap, mostUniques[0].id, 'Most Uniques Sacrificed');

			result += await addRoles({ g: g!, users: topSacrificers, role: Roles.TopSacrificer, badge: 8, userMap });
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

			result += await addRoles({
				g: g!,
				users: topMinigamers.map(i => i[0]),
				role: Roles.TopMinigamer,
				badge: 11,
				userMap
			});
		}

		// Top clue hunters
		async function topClueHunters() {
			let topClueHunters = (
				await Promise.all(
					ClueTiers.map(t =>
						q(
							`SELECT id, '${t.name}' as n, ("clueScores"->>'${t.id}')::int as qty
FROM users
WHERE "clueScores"->>'${t.id}' IS NOT NULL
ORDER BY qty DESC
LIMIT 1;`
						)
					)
				)
			).map((i: any) => [i[0]?.id, i[0]?.n]);

			let userMap = {};
			for (const [id, n] of topClueHunters) {
				addToUserMap(userMap, id, `Rank 1 ${n} Clues`);
			}

			result += await addRoles({
				g: g!,
				users: topClueHunters.map(i => i[0]),
				role: Roles.TopClueHunter,
				badge: null,
				userMap
			});
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
				`SELECT user_id as id, 'Top 2 Most Farming Trips' as desc
FROM activity
WHERE type = 'Farming'
GROUP BY user_id
ORDER BY count(user_id) DESC
LIMIT 2;`,
				`SELECT id, 'Top 2 Tithe Farm' as desc
FROM users
ORDER BY "stats.titheFarmsCompleted" DESC
LIMIT 2;`
			];
			let res = (await Promise.all(queries.map(q))).map((i: any) => [i[0]?.id, i[0]?.desc]);
			let userMap = {};
			for (const [id, desc] of res) {
				addToUserMap(userMap, id, desc);
			}

			result += await addRoles({
				g: g!,
				users: res.map(i => i[0]),
				role: '894194259731828786',
				badge: null,
				userMap
			});
		}

		// Top slayers
		async function slayer() {
			let topSlayers = (
				await Promise.all(
					[mostSlayerPointsQuery, longerSlayerTaskStreakQuery, mostSlayerTasksDoneQuery].map(query =>
						q(query)
					)
				)
			).map((i: any) => [i[0]?.id, i[0]?.desc]);

			let userMap = {};
			for (const [id, desc] of topSlayers) {
				addToUserMap(userMap, id, desc);
			}

			result += await addRoles({
				g: g!,
				users: topSlayers.map(i => i[0]),
				role: Roles.TopSlayer,
				badge: null,
				userMap
			});
		}

		async function monkeyKing() {
			const res = await q<any>('SELECT id FROM users ORDER BY cardinality(monkeys_fought) DESC LIMIT 1;');
			result += await addRoles({ g: g!, users: [res[0].id], role: '886180040465870918', badge: null });
		}

		const tup = [
			['Top Slayer', slayer],
			['Top Clue Hunters', topClueHunters],
			['Top Minigamers', topMinigamers],
			['Top Sacrificers', topSacrificers],
			['Top Collectors', topCollector],
			['Top Skillers', topSkillers],
			['Monkey King', monkeyKing],
			['Top Farmers', farmers]
		] as const;

		let failed: string[] = [];
		await Promise.all(
			tup.map(async ([name, fn]) => {
				try {
					await fn();
				} catch (err: any) {
					failed.push(`${name} (${err.message})`);
					console.error(err);
				}
			})
		);

		let res = result || 'Roles task: nothing to add or remove.';
		res += `\n\n${failed.length > 0 ? `Failed: ${failed.join(', ')}` : ''}`;

		return res;
	}
}
