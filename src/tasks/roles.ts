import { Guild } from 'discord.js';
import { Task } from 'klasa';

import { CLUser, SkillUser } from '../commands/Minion/leaderboard';
import { production } from '../config';
import { Roles } from '../lib/constants';
import { collectionLogTypes } from '../lib/data/collectionLog';
import ClueTiers from '../lib/minions/data/clueTiers';
import { UserSettings } from '../lib/settings/types/UserSettings';
import Skills from '../lib/skilling/skills';
import { convertXPtoLVL } from '../lib/util';

const collections = ['Pets', 'Skilling', 'Clue all', 'Boss', 'Minigames', 'Chambers of Xeric'];

async function addRoles(
	g: Guild,
	users: string[],
	role: Roles,
	badge: number | null
): Promise<string> {
	let added: string[] = [];
	let removed: string[] = [];
	const roleName = g.roles.get(role)!.name!;
	for (const mem of g.members.values()) {
		if (mem.roles.has(role) && !users.includes(mem.user.id)) {
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
			if (production && !mem.roles.has(role)) {
				await mem.roles.add(role);
			}
			if (badge && !mem.user.settings.get(UserSettings.Badges).includes(badge)) {
				await mem.user.settings.update(UserSettings.Badges, badge, {
					arrayAction: 'add'
				});
			}
			added.push(mem.user.username);
		}
	}
	return `
Added ${roleName} to: ${added.join(', ')}.
Removed ${roleName} from: ${removed.join(', ')}.
`;
}

export default class extends Task {
	async run() {
		const g = this.client.guilds.get('342983479501389826');
		if (!g) return;
		await g.members.fetch();
		const skillVals = Object.values(Skills);

		// Top Skillers
		const topSkillers = (
			await Promise.all([
				...skillVals.map(s =>
					this.client.query<
						{
							id: string;
							xp: string;
						}[]
					>(`SELECT id, "skills.${s.id}" as xp FROM users ORDER BY xp DESC LIMIT 1;`)
				),
				this.client.query<
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
			await this.client.query<SkillUser[]>(
				`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
					.map(s => `"skills.${s.id}"`)
					.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 200;`
			)
		)
			.map(u => {
				let totalLevel = 0;
				for (const skill of skillVals) {
					totalLevel += convertXPtoLVL(
						Number(u[`skills.${skill.id}` as keyof SkillUser]) as any
					);
				}
				return {
					id: u.id,
					totalLevel
				};
			})
			.sort((a, b) => b.totalLevel - a.totalLevel)[0];
		topSkillers.push(rankOneTotal.id);

		let result = await addRoles(g, topSkillers, Roles.TopSkiller, 9);

		// Top Collectors
		const topCollectors = await Promise.all(
			collections.map(async clName => {
				const type = collectionLogTypes.find(t => t.name === clName)!;
				const items = Object.values(type.items).flat(Infinity) as number[];
				const users = (
					await this.client.orm.query(
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

				return users[0].id;
			})
		);

		result += await addRoles(g, topCollectors, Roles.TopCollector, 10);

		// Top sacrificers
		let topSacrificers = [];
		const mostValue = await this.client.query<SkillUser[]>(
			`SELECT id FROM users ORDER BY "sacrificedValue" DESC LIMIT 3;`
		);
		for (const u of mostValue) topSacrificers.push(u.id);
		const mostUniques = await this.client.query<
			SkillUser[]
		>(`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("sacrificedBank")) sacbanklength, id FROM users
) u
ORDER BY u.sacbanklength DESC LIMIT 1;`);
		topSacrificers.push(mostUniques[0].id);

		result += await addRoles(g, topSacrificers, Roles.TopSacrificer, 8);

		// Top clue hunters
		let topClueHunters = (
			await Promise.all(
				ClueTiers.map(t =>
					this.client.query(
						`SELECT id, ("clueScores"->>'${t.id}')::int as qty
FROM users
WHERE "clueScores"->>'${t.id}' IS NOT NULL
ORDER BY qty DESC 
LIMIT 1;`
					)
				)
			)
		).map((i: any) => i[0].id);

		result += await addRoles(g, topClueHunters, Roles.TopeClueHunter, null);

		return result;
	}
}
