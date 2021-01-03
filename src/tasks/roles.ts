import { Guild } from 'discord.js';
import { Task } from 'klasa';

import { SkillUser } from '../commands/Minion/leaderboard';
import { production } from '../config';
import { collectionLogTypes } from '../lib/collectionLog';
import { Roles } from '../lib/constants';
import Skills from '../lib/skilling/skills';
import { convertXPtoLVL } from '../lib/util';
import { Workers } from '../lib/workers';
import { CLUser } from '../lib/workers/leaderboard.worker';

async function addRoles(g: Guild, users: string[], role: Roles): Promise<string> {
	let added: string[] = [];
	let removed: string[] = [];
	const roleName = g.roles.get(role)!.name!;
	for (const mem of g.members.values()) {
		if (mem.roles.has(role) && !users.includes(mem.user.id)) {
			if (production) {
				await mem.roles.remove(role);
			}
			removed.push(mem.user.username);
		}

		if (users.includes(mem.user.id)) {
			if (production && !mem.roles.has(role)) {
				await mem.roles.add(role);
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
		let topSkillers = [];
		for (const skill of skillVals) {
			const rankOne = (
				await this.client.query<
					{
						id: string;
						xp: string;
					}[]
				>(`SELECT id, "skills.${skill.id}" as xp FROM users ORDER BY xp DESC LIMIT 1;`)
			)[0];
			topSkillers.push(rankOne.id);
		}

		// Rank 1 XP
		const rankOne = await this.client.query<
			{
				id: string;
			}[]
		>(
			`SELECT id,  ${skillVals.map(s => `"skills.${s.id}"`)}, ${skillVals
				.map(s => `"skills.${s.id}"`)
				.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 1;`
		);
		topSkillers.push(rankOne[0].id);

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

		let result = await addRoles(g, topSkillers, Roles.TopSkiller);

		// Top Collectors
		const topCollectors = [];
		for (const clName of ['Pets', 'Skilling', 'Clue all', 'Boss']) {
			const type = collectionLogTypes.find(t => t.name === clName)!;
			const result = (await this.client.query(
				`SELECT u.id, u."logBankLength", u."collectionLogBank" FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("collectionLogBank")) "logBankLength" , id, "collectionLogBank" FROM users
) u
WHERE u."logBankLength" > 400 ORDER BY u."logBankLength" DESC;`
			)) as CLUser[];
			const users = await Workers.leaderboard({
				type: 'cl',
				users: result,
				collectionLogInput: type
			});
			topCollectors.push(users[0].id);
		}

		result += await addRoles(g, topCollectors, Roles.TopCollector);
		return result;
	}
}
