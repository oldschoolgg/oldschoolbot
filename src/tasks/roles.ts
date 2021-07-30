import { Guild } from 'discord.js';
import { Task } from 'klasa';

import { CLUser, SkillUser } from '../commands/Minion/leaderboard';
import { production } from '../config';
import { Roles } from '../lib/constants';
import { collectionLogRoleCategories } from '../lib/data/Collections';
import ClueTiers from '../lib/minions/data/clueTiers';
import { UserSettings } from '../lib/settings/types/UserSettings';
import Skills from '../lib/skilling/skills';
import { convertXPtoLVL } from '../lib/util';

const minigames = [
	'barb_assault',
	'agility_arena',
	'mahogany_homes',
	'gnome_restaurant',
	'soul_wars',
	'castle_wars',
	'raids',
	'raids_challenge_mode',
	'big_chompy_bird_hunting',
	'rogues_den',
	'temple_trekking'
];

const collections = ['overall', 'pets', 'skilling', 'clues', 'bosses', 'minigames', 'raids', 'slayer'];

const mostSlayerPointsQuery = `SELECT id
FROM users
WHERE "slayer.points" > 50
ORDER BY "slayer.points" DESC
LIMIT 1;`;

const longerSlayerTaskStreakQuery = `SELECT id
FROM users
WHERE "slayer.task_streak" > 20
ORDER BY "slayer.task_streak" DESC
LIMIT 1;`;

const mostSlayerTasksDoneQuery = `SELECT user_id as id
FROM slayer_tasks
GROUP BY user_id
ORDER BY count(user_id) DESC
LIMIT 1;`;

async function addRoles(g: Guild, users: string[], role: Roles, badge: number | null): Promise<string> {
	let added: string[] = [];
	let removed: string[] = [];
	const roleName = g.roles.cache.get(role)!.name!;
	for (const mem of g.members.cache.values()) {
		if (mem.roles.cache.has(role) && !users.includes(mem.user.id)) {
			if (production) {
				await mem.roles.remove(role);
			}
			if (badge && mem.user.settings.get(UserSettings.Badges).includes(badge)) {
				await mem.user.settings.update(UserSettings.Badges, badge, {
					arrayAction: 'remove'
				});
			}
			removed.push(mem.user.username);
		}

		if (users.includes(mem.user.id)) {
			if (production && !mem.roles.cache.has(role)) {
				added.push(mem.user.username);
				await mem.roles.add(role);
			}
			if (badge && !mem.user.settings.get(UserSettings.Badges).includes(badge)) {
				await mem.user.settings.update(UserSettings.Badges, badge, {
					arrayAction: 'add'
				});
			}
		}
	}
	let str = `**${roleName}**`;
	if (added.length > 0) {
		str += `\nAdded to: ${added.join(', ')}.`;
	}
	if (removed.length > 0) {
		str += `\nRemoved from: ${removed.join(', ')}.`;
	}
	if (added.length || removed.length) {
		str += '\n\n';
	} else {
		return '';
	}
	return str;
}

export default class extends Task {
	async run() {
		const g = this.client.guilds.cache.get('342983479501389826');
		if (!g) return;
		await g.members.fetch();
		const skillVals = Object.values(Skills);

		let result = '';
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const q = <T>(str: string) => this.client.query<T>(str);

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
							.map(s => `"skills.${s.id}"`)
							.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 1;`
					)
				])
			).map(i => i[0].id);

			// Rank 1 Total Level
			const rankOneTotal = (
				await q<SkillUser[]>(
					`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
						.map(s => `"skills.${s.id}"`)
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

			result += await addRoles(g!, topSkillers, Roles.TopSkiller, 9);
		}

		// Top Collectors
		async function topCollector() {
			const topCollectors = await Promise.all(
				collections.map(async clName => {
					const items = collectionLogRoleCategories[clName];
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

					return users?.[0]?.id;
				})
			);

			result += await addRoles(g!, topCollectors, Roles.TopCollector, 10);
		}

		// Top sacrificers
		async function topSacrificers() {
			let topSacrificers = [];
			const mostValue = await q<SkillUser[]>('SELECT id FROM users ORDER BY "sacrificedValue" DESC LIMIT 3;');
			for (const u of mostValue) topSacrificers.push(u.id);
			const mostUniques = await q<SkillUser[]>(`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("sacrificedBank")) sacbanklength, id FROM users
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`);
			topSacrificers.push(mostUniques[0].id);

			result += await addRoles(g!, topSacrificers, Roles.TopSacrificer, 8);
		}

		// Top minigamers
		async function topMinigamers() {
			let topMinigamers = (
				await Promise.all(
					minigames.map(m =>
						q(
							`SELECT user_id
FROM minigames
ORDER BY ${m} DESC
LIMIT 1;`
						)
					)
				)
			).map((i: any) => i[0].user_id);

			result += await addRoles(g!, topMinigamers, Roles.TopMinigamer, 11);
		}

		// Top clue hunters
		async function topClueHunters() {
			let topClueHunters = (
				await Promise.all(
					ClueTiers.map(t =>
						q(
							`SELECT id, ("clueScores"->>'${t.id}')::int as qty
FROM users
WHERE "clueScores"->>'${t.id}' IS NOT NULL
ORDER BY qty DESC
LIMIT 1;`
						)
					)
				)
			).map((i: any) => i[0].id);

			result += await addRoles(g!, topClueHunters, Roles.TopClueHunter, null);
		}

		// Top slayers
		async function slayer() {
			let topSlayers = (
				await Promise.all(
					[mostSlayerPointsQuery, longerSlayerTaskStreakQuery, mostSlayerTasksDoneQuery].map(query =>
						q(query)
					)
				)
			).map((i: any) => i[0].id);

			result += await addRoles(g!, topSlayers, Roles.TopSlayer, null);
		}

		await Promise.all(
			[slayer, topClueHunters, topMinigamers, topSacrificers, topCollector, topSkillers].map(async fn => {
				try {
					await fn();
				} catch (err) {
					console.error(err);
				}
			})
		);

		return result;
	}
}
