import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';

import { production } from '../../config';
import { badges, Emoji } from '../../lib/constants';
import { getCollectionItems } from '../../lib/data/Collections';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { prisma } from '../../lib/settings/prisma';
import { Minigames } from '../../lib/settings/settings';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import {
	convertXPtoLVL,
	formatDuration,
	makePaginatedMessage,
	stringMatches,
	stripEmojis,
	toTitleCase
} from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import PostgresProvider from '../../providers/postgres';
import { allOpenables } from './open';

const allOpenableItems = allOpenables.map(getOSItem);

export const LB_PAGE_SIZE = 10;

export interface CLUser {
	id: string;
	qty: number;
}

export interface SkillUser {
	id: string;
	totalxp?: number;
	['minion.ironman']: boolean;
	['skills.woodcutting']?: number;
	['skills.mining']?: number;
	['skills.smithing']?: number;
	['skills.firemaking']?: number;
	['skills.runecraft']?: number;
	['skills.cooking']?: number;
}

interface OverallSkillUser {
	id: string;
	totalLevel: number;
	totalXP: number;
	ironman: boolean;
}

interface GPUser {
	id: string;
	GP: number;
}

interface QPUser {
	id: string;
	QP: number;
}

interface PetUser {
	id: string;
	petcount: number;
}

interface KCUser {
	id: string;
	monsterScores: ItemBank;
	minigameScores: ItemBank;
}

interface UsernameCache {
	lastUpdated: number;
	map: Map<string, string>;
}

export default class extends BotCommand {
	public usernameCache: UsernameCache = {
		lastUpdated: 0,
		map: new Map()
	};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the bots leaderboards.',
			usage: '[pets|gp|kc|cl|qp|skills|sacrifice|laps|creatures|minigame|itemcontracts|itemcontractstreak|farmingcontracts|xp|open|inferno|uniquesac] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['lb'],
			requiredPermissionsForBot: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES'],
			oneAtTime: true,
			categoryFlags: ['minion', 'utility'],
			examples: [
				'+lb gp',
				'+lb kc vorkath',
				'+lb skills mining',
				'+lb laps',
				'+lb cl boss',
				'+lb sacrifice',
				'+lb qp'
			]
		});
	}

	async init() {
		if (production) await this.cacheUsernames();
	}

	getPos(page: number, record: number) {
		return `${page * LB_PAGE_SIZE + 1 + record}. `;
	}

	getUsername(userID: string, lbSize?: number) {
		if (lbSize && lbSize < 10) return '(Anonymous)';
		const username = this.usernameCache.map.get(userID);
		if (!username) return '(Unknown)';
		return username;
	}

	async cacheUsernames() {
		const allNewUsers = await prisma.newUser.findMany({
			where: {
				username: {
					not: null
				}
			}
		});

		const arrayOfIronmenAndBadges: { badges: number[]; id: string; ironman: boolean }[] = await this.query(
			'SELECT "badges", "id", "minion.ironman" as "ironman" FROM users WHERE ARRAY_LENGTH(badges, 1) > 0 OR "minion.ironman" = true;',
			false
		);

		for (const user of allNewUsers) {
			const badgeUser = arrayOfIronmenAndBadges.find(i => i.id === user.id);
			let name = stripEmojis(user.username!);
			if (badgeUser) {
				const rawBadges = badgeUser.badges.map(num => badges[num]);
				if (badgeUser.ironman) {
					rawBadges.push(Emoji.Ironman);
				}
				name = `${rawBadges.join(' ')} ${name}`;
			}
			this.usernameCache.map.set(user.id, name);
		}
	}

	async run(msg: KlasaMessage) {
		this.skills(msg, ['overall']);
		return null;
	}

	async xp(msg: KlasaMessage) {
		msg.flagArgs.xp = 'xp';
		this.skills(msg, ['overall']);
		return null;
	}

	async inferno(msg: KlasaMessage) {
		const res = await this.query(`SELECT user_id, duration
FROM activity
WHERE type = 'Inferno'
AND data->>'deathTime' IS NULL
AND completed = true
ORDER BY duration ASC
LIMIT 10;`);

		if (res.length === 0) {
			return msg.channel.send('No results.');
		}

		return msg.channel.send(
			`**Inferno Records**\n\n${res
				.map((e, i) => `${i + 1}. **${this.getUsername(e.user_id)}:** ${formatDuration(e.duration)}`)
				.join('\n')}`
		);
	}

	async query(query: string, cacheUsernames = true) {
		const result = await (this.client.providers.default as PostgresProvider).runAll(query);
		if (cacheUsernames) this.cacheUsernames();
		return result;
	}

	async gp(msg: KlasaMessage) {
		const users = (
			await this.query(
				`SELECT "id", "GP"
					   FROM users
					   WHERE "GP" > 1000000
					   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY "GP" DESC
					   LIMIT 500;`
			)
		).map((res: any) => ({ ...res, GP: parseInt(res.GP) })) as GPUser[];

		this.doMenu(
			msg,
			util
				.chunk(users, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, GP }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${GP.toLocaleString()} GP`
						)
						.join('\n')
				),
			'GP Leaderboard'
		);
	}

	async uniquesac(msg: KlasaMessage) {
		const mostUniques: { id: string; sacbanklength: number }[] =
			await prisma.$queryRaw`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("sacrificedBank")) sacbanklength, id FROM users
) u
ORDER BY u.sacbanklength DESC LIMIT 10;`;
		this.doMenu(
			msg,
			util
				.chunk(mostUniques, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, sacbanklength }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(
									id
								)}:** ${sacbanklength.toLocaleString()} Unique Sac's`
						)
						.join('\n')
				),
			'Unique Sacrifice Leaderboard'
		);
	}

	async sacrifice(msg: KlasaMessage) {
		const list: { id: string; amount: number }[] = (
			await this.query(
				`SELECT "id", "sacrificedValue"
					   FROM users
					   WHERE "sacrificedValue" > 0
					   ${msg.flagArgs.im ? 'AND "minion.ironman" = true' : ''}
					   ORDER BY "sacrificedValue"
					   DESC LIMIT 2000;`
			)
		).map((res: any) => ({ ...res, amount: parseInt(res.sacrificedValue) }));

		this.doMenu(
			msg,
			util
				.chunk(list, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, amount }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${amount.toLocaleString()} GP `
						)
						.join('\n')
				),
			'Sacrifice Leaderboard'
		);
	}

	async qp(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;

		let list = (
			await this.query(
				`SELECT "id", "QP"
					   FROM users
					   WHERE "QP" > 0
					   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY "QP" DESC
					   LIMIT 2000;`
			)
		).map((res: any) => ({ ...res, GP: parseInt(res.GP) }));

		if (onlyForGuild && msg.guild) {
			list = list.filter((qpUser: QPUser) => msg.guild!.members.cache.has(qpUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, QP }, j) => `${this.getPos(i, j)}**${this.getUsername(id)}:** ${QP.toLocaleString()}`
						)
						.join('\n')
				),
			'QP Leaderboard'
		);
	}

	async farmingcontracts(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;

		let list = await this.query(
			`SELECT id, CAST("minion.farmingContract"->>'contractsCompleted' AS INTEGER) as count
				   FROM users
				   WHERE "minion.farmingContract" is not null and CAST ("minion.farmingContract"->>'contractsCompleted' AS INTEGER) >= 1
				   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
				   ORDER BY count DESC
				   LIMIT 2000;`
		);

		if (onlyForGuild && msg.guild) {
			list = list.filter(user => msg.guild!.members.cache.has(user.id));
		}

		this.doMenu(
			msg,
			util.chunk(list, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(({ id, count }, j) => {
						return `${this.getPos(i, j)}**${this.getUsername(id)}:** ${count.toLocaleString()}`;
					})
					.join('\n')
			),
			'Farming contracts Leaderboard'
		);
	}

	async pets(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;
		let list = await this.query(
			`select id, count(p) as petcount
				   from users, json_object_keys(pets) p
				   ${msg.flagArgs.im ? ' WHERE "minion.ironman" = true ' : ''}
				   group by id
				   order by petcount desc
				   limit 2000`
		);
		if (onlyForGuild && msg.guild) {
			list = list.filter((gpUser: PetUser) => msg.guild!.members.cache.has(gpUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, petcount }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${petcount.toLocaleString()}`
						)
						.join('\n')
				),
			'Pet Leaderboard'
		);
	}

	async minigame(msg: KlasaMessage, [name = '']: [string]) {
		const minigame = Minigames.find(
			m => stringMatches(m.name, name) || m.aliases.some(a => stringMatches(a, name))
		);
		if (!minigame) {
			return msg.channel.send(
				`That's not a valid minigame. Valid minigames are: ${Minigames.map(m => m.name).join(', ')}.`
			);
		}

		const res = await prisma.minigame.findMany({
			where: {
				[minigame.column]: {
					gt: 10
				}
			},
			orderBy: {
				[minigame.column]: 'desc'
			},
			take: 10
		});

		this.doMenu(
			msg,
			util
				.chunk(res, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							(u, j) =>
								`${this.getPos(i, j)}**${this.getUsername(u.user_id)}:** ${u[
									minigame.column
								].toLocaleString()}`
						)
						.join('\n')
				),
			`${minigame.name} Leaderboard`
		);
	}

	async kc(msg: KlasaMessage, [name = '']: [string]) {
		const monster = effectiveMonsters.find(
			mon => stringMatches(mon.name, name) || mon.aliases.some(alias => stringMatches(alias, name))
		);
		if (!monster) {
			return msg.channel.send("That's not a valid monster!");
		}
		let list = await this.query(
			`SELECT id, CAST("monsterScores"->>'${monster.id}' AS INTEGER) as kc
					   FROM users
					   WHERE CAST("monsterScores"->>'${monster.id}' AS INTEGER) > 5
					   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY kc DESC
					   LIMIT 2000;`
		);

		if (msg.flagArgs.server && msg.guild) {
			list = list.filter((kcUser: KCUser) => msg.guild!.members.cache.has(kcUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							(user, j) =>
								`${this.getPos(i, j)}**${this.getUsername(user.id)}:** ${user.kc.toLocaleString()}`
						)
						.join('\n')
				),
			`KC Leaderboard for ${monster.name}`
		);
	}

	async open(msg: KlasaMessage, [name = '']: [string]) {
		name = name.trim();

		let entityID = -1;
		let key = '';
		let openableName = '';

		const clue = !name
			? undefined
			: ClueTiers.find(
					clue => stringMatches(clue.name, name) || clue.name.toLowerCase().includes(name.toLowerCase())
			  );

		if (clue) {
			entityID = clue.id;
			key = 'clueScores';
			openableName = clue.name;
		} else {
			const openable = !name
				? undefined
				: allOpenableItems.find(
						item => stringMatches(item.name, name) || item.name.toLowerCase().includes(name.toLowerCase())
				  );
			if (openable) {
				entityID = openable.id;
				key = 'openable_scores';
				openableName = openable.name;
			}
		}

		if (entityID === -1) {
			return msg.channel.send(
				`That's not a valid openable item! You can check: ${allOpenableItems.map(i => i.name).join(', ')}.`
			);
		}

		let list = await this.query(
			`SELECT id, ("${key}"->>'${entityID}')::int as qty FROM users
			WHERE ("${key}"->>'${entityID}')::int > 3
			${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
			ORDER BY qty DESC LIMIT 30;`
		);

		this.doMenu(
			msg,
			util
				.chunk(list, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							(user, j) =>
								`${this.getPos(i, j)}**${this.getUsername(
									user.id,
									list.length
								)}:** ${user.qty.toLocaleString()}`
						)
						.join('\n')
				),
			`Open Leaderboard for ${openableName}`
		);
	}

	async skills(msg: KlasaMessage, [inputSkill = 'overall']: [string]) {
		let res: SkillUser[] = [];
		let overallUsers: OverallSkillUser[] = [];

		const skillsVals = Object.values(Skills);

		const skill = skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, inputSkill)));

		if (inputSkill === 'overall') {
			const query = `SELECT
								u.id,
								${skillsVals.map(s => `"skills.${s.id}"`)},
								${skillsVals.map(s => `"skills.${s.id}"::int8`).join(' + ')} as totalxp,
								u."minion.ironman"
							FROM
								users u
							${msg.flagArgs.im ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY totalxp DESC
							LIMIT 2000;`;
			res = await this.query(query);
			overallUsers = res.map(user => {
				let totalLevel = 0;
				for (const skill of skillsVals) {
					totalLevel += convertXPtoLVL(Number(user[`skills.${skill.id}` as keyof SkillUser]) as any, 120);
				}
				return {
					id: user.id,
					totalLevel,
					ironman: user['minion.ironman'],
					totalXP: Number(user.totalxp!)
				};
			});
			if (!msg.flagArgs.xp) {
				overallUsers.sort((a, b) => b.totalLevel - a.totalLevel);
			}
			overallUsers.slice(0, 100);
		} else {
			if (!skill) {
				return msg.channel.send("That's not a valid skill.");
			}

			const query = `SELECT
								u."skills.${skill.id}", u.id, u."minion.ironman"
							FROM
								users u
							${msg.flagArgs.im ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY
								1 DESC
							LIMIT 2000;`;
			res = await this.query(query);
		}

		const onlyForGuild = msg.flagArgs.server;

		if (onlyForGuild && msg.guild) {
			res = res.filter((user: SkillUser) => msg.guild!.members.cache.has(user.id));
		}

		if (msg.flagArgs.im || msg.flagArgs.ironman) {
			res = res.filter((user: SkillUser) => user['minion.ironman']);
		}

		if (inputSkill === 'overall') {
			this.doMenu(
				msg,
				util.chunk(overallUsers, LB_PAGE_SIZE).map((subList, i) =>
					subList
						.map((obj: OverallSkillUser, j) => {
							return `${this.getPos(i, j)}**${this.getUsername(
								obj.id
							)}:** ${obj.totalLevel.toLocaleString()} (${obj.totalXP.toLocaleString()} XP)`;
						})
						.join('\n')
				),
				`Overall Leaderboard${msg.flagArgs.xp ? ' (XP)' : ''}`
			);
			return;
		}

		this.doMenu(
			msg,
			util.chunk(res, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map((obj: SkillUser, j) => {
						const objKey = `skills.${skill?.id}` as keyof SkillUser;
						const skillXP = Number(obj[objKey] ?? 0);

						return `${this.getPos(i, j)}**${this.getUsername(
							obj.id
						)}:** ${skillXP.toLocaleString()} XP (${convertXPtoLVL(skillXP, 120)})`;
					})
					.join('\n')
			),
			`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
		);
	}

	async itemcontracts(msg: KlasaMessage) {
		const result = await prisma.user.findMany({
			select: {
				id: true,
				total_item_contracts: true
			},
			where: {
				total_item_contracts: {
					gte: 5
				}
			},
			orderBy: {
				total_item_contracts: 'desc'
			},
			take: 50
		});

		this.doMenu(
			msg,
			util
				.chunk(result, 10)
				.map(subList =>
					subList
						.map(({ id, total_item_contracts }) => `**${this.getUsername(id)}:** ${total_item_contracts}`)
						.join('\n')
				),
			'Item Contract Leaderboard'
		);
	}

	async itemcontractstreak(msg: KlasaMessage) {
		const results = await prisma.user.findMany({
			select: {
				id: true,
				item_contract_streak: true
			},
			where: {
				item_contract_streak: {
					gte: 5
				}
			},
			orderBy: {
				item_contract_streak: 'desc'
			},
			take: 10
		});

		this.doMenu(
			msg,
			util
				.chunk(results, 10)
				.map(subList =>
					subList
						.map(({ id, item_contract_streak }) => `**${this.getUsername(id)}:** ${item_contract_streak}`)
						.join('\n')
				),
			'Item Contract Streak Leaderboard'
		);
	}

	async cl(msg: KlasaMessage, [inputType = 'overall']: [string]) {
		const items = getCollectionItems(inputType, false);
		if (!items || items.length === 0) {
			return msg.channel.send("That's not a valid collection log category. Check +cl for all possible logs.");
		}
		const users = (
			(await prisma.$queryRawUnsafe(`
SELECT id, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT array(SELECT * FROM jsonb_object_keys("collectionLogBank")) "cl_keys",
  				id, "collectionLogBank",
			    cardinality(array(SELECT * FROM jsonb_object_keys("collectionLogBank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
  FROM users
  WHERE "collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
  ${msg.flagArgs.im ? 'AND "minion.ironman" = true' : ''}
) u
ORDER BY qty DESC
LIMIT 50;
`)) as any
		).filter((i: any) => i.qty > 0) as CLUser[];

		this.doMenu(
			msg,
			util
				.chunk(users, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, qty }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${qty.toLocaleString()}`
						)
						.join('\n')
				),
			`${toTitleCase(inputType.toLowerCase())} Collection Log Leaderboard (${items.length} slots)`
		);
	}

	async laps(msg: KlasaMessage, [courseName = '']: [string]) {
		const course = Agility.Courses.find(course => course.aliases.some(alias => stringMatches(alias, courseName)));

		if (!course) return msg.channel.send('Thats not a valid agility course.');

		const data: { id: string; count: number }[] = await this.query(
			`SELECT id, ("lapsScores"->>'${course.id}')::int as count
				   FROM users
				   WHERE "lapsScores"->>'${course.id}' IS NOT NULL
				   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
				   ORDER BY count DESC LIMIT 50;`
		);
		this.doMenu(
			msg,
			util
				.chunk(data, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, count }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${count.toLocaleString()}`
						)
						.join('\n')
				),
			`${course.name} Laps Leaderboard`
		);
	}

	async creatures(msg: KlasaMessage, [creatureName = '']: [string]) {
		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature)
			return msg.channel.send(
				`Thats not a valid creature. Valid creatures are: ${Hunter.Creatures.map(h => h.name).join(', ')}`
			);

		const query = `SELECT id, ("creatureScores"->>'${creature.id}')::int as count
				   FROM users WHERE "creatureScores"->>'${creature.id}' IS NOT NULL
				   ${msg.flagArgs.im ? ' AND "minion.ironman" = true ' : ''}
				   ORDER BY count DESC LIMIT 50;`;
		const data: { id: string; count: number }[] = await this.query(query);
		this.doMenu(
			msg,
			util
				.chunk(data, LB_PAGE_SIZE)
				.map((subList, i) =>
					subList
						.map(
							({ id, count }, j) =>
								`${this.getPos(i, j)}**${this.getUsername(id)}:** ${count.toLocaleString()}`
						)
						.join('\n')
				),
			`Catch Leaderboard for ${creature.name}`
		);
	}

	async doMenu(msg: KlasaMessage, pages: string[], title: string) {
		if (pages.length === 0) {
			return msg.channel.send('Nobody is on this leaderboard.');
		}
		return makePaginatedMessage(
			msg,
			pages.map(p => ({ embeds: [new MessageEmbed().setTitle(title).setDescription(p)] }))
		);
	}
}
