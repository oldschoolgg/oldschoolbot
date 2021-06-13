import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { IsNull, Not } from 'typeorm';

import { Minigames } from '../../extendables/User/Minigame';
import { badges, Emoji, Time } from '../../lib/constants';
import { collectionLogTypes } from '../../lib/data/collectionLog';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { batchSyncNewUserUsernames } from '../../lib/settings/settings';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { BotCommand } from '../../lib/structures/BotCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';
import { NewUserTable } from '../../lib/typeorm/NewUserTable.entity';
import { ItemBank, SettingsEntry } from '../../lib/types';
import { convertXPtoLVL, stringMatches, stripEmojis, toTitleCase } from '../../lib/util';
import PostgresProvider from '../../providers/postgres';

const CACHE_TIME = Time.Minute * 5;

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

interface GPLeaderboard {
	lastUpdated: number;
	list: GPUser[];
}

interface QPLeaderboard {
	lastUpdated: number;
	list: QPUser[];
}

interface PetLeaderboard {
	lastUpdated: number;
	list: PetUser[];
}

interface UsernameCache {
	lastUpdated: number;
	map: Map<string, string>;
}

export default class extends BotCommand {
	public settingEntryCache: SettingsEntry[] = [];
	public lastCacheUpdate = 0;

	public usernameCache: UsernameCache = {
		lastUpdated: 0,
		map: new Map()
	};

	public gpLeaderboard: GPLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public qpLeaderboard: QPLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public petLeaderboard: PetLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the bots leaderboards.',
			usage:
				'[pets|gp|petrecords|kc|cl|qp|skills|sacrifice|laps|creatures|minigame|itemcontracts] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['lb'],
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES'],
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
		await this.cacheUsernames();
	}

	getUsername(userID: string) {
		const username = this.usernameCache.map.get(userID);
		if (!username) return '(Unknown)';
		return username;
	}

	async cacheUsernames() {
		const allNewUsers = await NewUserTable.find({
			username: Not(IsNull())
		});
		for (const user of allNewUsers) {
			this.usernameCache.map.set(user.id, stripEmojis(user.username!));
		}

		const arrayOfUsers: {
			badges: number[];
			id: string;
			ironman: boolean;
		}[] = await this.query(
			`SELECT "badges", "id", "minion.ironman" as "ironman" FROM users WHERE ARRAY_LENGTH(badges, 1) > 0 OR "minion.ironman" = true;`,
			false
		);

		for (const user of arrayOfUsers) {
			const rawName = this.usernameCache.map.get(user.id) ?? '(Unknown)';
			const rawBadges = user.badges.map(num => badges[num]);
			if (user.ironman) {
				rawBadges.push(Emoji.Ironman);
			}
			this.usernameCache.map.set(user.id, `${rawBadges.join(' ')} ${rawName}`);
		}

		batchSyncNewUserUsernames(this.client);
	}

	async run(msg: KlasaMessage) {
		this.skills(msg, ['overall']);
		return null;
	}

	async query(query: string, cacheUsernames = true) {
		const result = await (this.client.providers.default as PostgresProvider).runAll(query);
		if (cacheUsernames) this.cacheUsernames();
		return result;
	}

	async gp(msg: KlasaMessage) {
		const users = (
			await this.query(
				`SELECT "id", "GP" FROM users WHERE "GP" > 1000000 ORDER BY "GP" DESC LIMIT 500;`
			)
		).map((res: any) => ({ ...res, GP: parseInt(res.GP) })) as GPUser[];

		this.doMenu(
			msg,
			util
				.chunk(users, 10)
				.map(subList =>
					subList
						.map(
							({ id, GP }) =>
								`**${this.getUsername(id)}** has ${GP.toLocaleString()} GP `
						)
						.join('\n')
				),
			'GP Leaderboard'
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
		).map((res: any) => ({
			...res,
			amount: parseInt(res.sacrificedValue)
		}));

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(
							({ id, amount }) =>
								`**${this.getUsername(
									id
								)}** sacrificed ${amount.toLocaleString()} GP `
						)
						.join('\n')
				),
			'Sacrifice Leaderboard'
		);
	}

	async qp(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;

		if (Date.now() - this.qpLeaderboard.lastUpdated > CACHE_TIME) {
			this.qpLeaderboard.list = (
				await this.query(
					`SELECT "id", "QP" FROM users WHERE "QP" > 0 ORDER BY "QP" DESC LIMIT 2000;`
				)
			).map((res: any) => ({ ...res, GP: parseInt(res.GP) }));
			this.qpLeaderboard.lastUpdated = Date.now();
		}

		let { list } = this.qpLeaderboard;

		if (onlyForGuild && msg.guild) {
			list = list.filter((qpUser: QPUser) => msg.guild!.members.cache.has(qpUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(
							({ id, QP }) =>
								`**${this.getUsername(id)}** has ${QP.toLocaleString()} QP`
						)
						.join('\n')
				),
			'QP Leaderboard'
		);
	}

	async pets(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;

		if (Date.now() - this.petLeaderboard.lastUpdated > CACHE_TIME) {
			this.petLeaderboard.list = await this.query(
				`SELECT u.id, u.petcount FROM (
  SELECT (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(pets)) petcount, id FROM users
) u
ORDER BY u.petcount DESC LIMIT 2000;`
			);
			this.petLeaderboard.lastUpdated = Date.now();
		}

		let { list } = this.petLeaderboard;

		if (onlyForGuild && msg.guild) {
			list = list.filter((gpUser: PetUser) => msg.guild!.members.cache.has(gpUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(
							({ id, petcount }) =>
								`**${this.getUsername(id)}** has ${petcount.toLocaleString()} pets `
						)
						.join('\n')
				),
			'Pet Leaderboard'
		);
	}

	async minigame(msg: KlasaMessage, [name = '']: [string]) {
		const minigame = Minigames.find(m => stringMatches(m.name, name));
		if (!minigame) {
			return msg.send(
				`That's not a valid minigame. Valid minigames are: ${Minigames.map(
					m => m.name
				).join(', ')}.`
			);
		}

		const res: MinigameTable[] = await MinigameTable.getRepository()
			.createQueryBuilder('user')
			.orderBy(minigame.column, 'DESC')
			.where(`${minigame.column} > 10`)
			.limit(100)
			.getMany();

		this.doMenu(
			msg,
			util
				.chunk(res, 10)
				.map(subList =>
					subList
						.map(u => `**${this.getUsername(u.userID)}:** ${u[minigame.key]}`)
						.join('\n')
				),
			`${minigame.name} Leaderboard`
		);
	}

	async kc(msg: KlasaMessage, [name = '']: [string]) {
		const monster = effectiveMonsters.find(
			mon =>
				stringMatches(mon.name, name) ||
				mon.aliases.some(alias => stringMatches(alias, name))
		);
		if (!monster) {
			return msg.send(`That's not a valid monster!`);
		}

		let key = 'monsterScores' as const;
		let entityID = monster.id;
		let list = (
			await this.query(
				`SELECT id, "${key}" FROM users WHERE CAST ("${key}"->>'${entityID}' AS INTEGER) > 5;`
			)
		)
			.filter(user => typeof user[key][entityID] === 'number')
			.sort((a: KCUser, b: KCUser) => {
				const aScore = a[key]![entityID] ?? 0;
				const bScore = b[key]![entityID] ?? 0;
				return bScore - aScore;
			})
			.slice(0, 2000);

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(user => `**${this.getUsername(user.id)}:** ${user[key][entityID]} KC`)
						.join('\n')
				),
			`KC Leaderboard for ${monster.name}`
		);
	}

	async skills(msg: KlasaMessage, [inputSkill = 'overall']: [string]) {
		let res: SkillUser[] = [];
		let overallUsers: OverallSkillUser[] = [];

		const skillsVals = Object.values(Skills);

		const skill = skillsVals.find(_skill =>
			_skill.aliases.some(name => stringMatches(name, inputSkill))
		);

		if (inputSkill === 'overall') {
			res = await this.query(
				`SELECT id,  ${skillsVals.map(s => `"skills.${s.id}"`)}, ${skillsVals
					.map(s => `"skills.${s.id}"`)
					.join(' + ')} as totalxp
FROM users
${msg.flagArgs.im ? 'WHERE "minion.ironman" = true' : ''}
ORDER BY totalxp
DESC LIMIT 500;`
			);
			overallUsers = res
				.map(user => {
					let totalLevel = 0;
					for (const skill of skillsVals) {
						totalLevel += convertXPtoLVL(
							Number(user[`skills.${skill.id}` as keyof SkillUser]) as any,
							120
						);
					}
					return {
						id: user.id,
						totalLevel,
						ironman: user['minion.ironman'],
						totalXP: Number(user.totalxp!)
					};
				})
				.sort((a, b) => b.totalLevel - a.totalLevel);
		} else {
			if (!skill) {
				return msg.send(`That's not a valid skill.`);
			}

			res = await this.query(
				`SELECT "skills.${skill.id}", id, "minion.ironman" FROM users ORDER BY "skills.${skill.id}" DESC LIMIT 2000;`
			);
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
				util.chunk(overallUsers, 10).map(subList =>
					subList
						.map((obj: OverallSkillUser) => {
							return `**${this.getUsername(
								obj.id
							)}:** ${obj.totalLevel.toLocaleString()} (${obj.totalXP.toLocaleString()} XP)`;
						})
						.join('\n')
				),
				`Overall Leaderboard`
			);
			return;
		}

		this.doMenu(
			msg,
			util.chunk(res, 10).map(subList =>
				subList
					.map((obj: SkillUser) => {
						const objKey = `skills.${skill?.id}` as keyof SkillUser;
						const skillXP = Number(obj[objKey] ?? 0);

						return `**${this.getUsername(
							obj.id
						)}:** ${skillXP.toLocaleString()} xp (${convertXPtoLVL(skillXP, 120)})`;
					})
					.join('\n')
			),
			`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
		);
	}

	async itemcontracts(msg: KlasaMessage) {
		const result: { id: string; qty: number }[] = await this.client.orm.query(`
SELECT id, total_item_contracts as qty
FROM users
WHERE total_item_contracts > 0
ORDER BY total_item_contracts DESC
LIMIT 50;
`);
		this.doMenu(
			msg,
			util
				.chunk(result, 10)
				.map(subList =>
					subList.map(({ id, qty }) => `**${this.getUsername(id)}:** ${qty}`).join('\n')
				),
			`Item Contract Leaderboard`
		);
	}

	async cl(msg: KlasaMessage, [inputType = 'all']: [string]) {
		const type = collectionLogTypes.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type) {
			return msg.send(
				`That's not a valid collection log type. The valid types are: ${collectionLogTypes
					.map(type => type.name)
					.join(', ')}`
			);
		}

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
  ${msg.flagArgs.im ? 'AND "minion.ironman" = true' : ''}
) u
ORDER BY qty DESC
LIMIT 50;
`
			)
		).filter((i: any) => i.qty > 0) as CLUser[];

		if (users.length === 0) {
			return msg.channel.send(`No users found.`);
		}

		this.doMenu(
			msg,
			util
				.chunk(users, 10)
				.map(subList =>
					subList.map(({ id, qty }) => `**${this.getUsername(id)}:** ${qty}`).join('\n')
				),
			`${type.name} Collection Log Leaderboard`
		);
	}

	async laps(msg: KlasaMessage, [courseName = '']: [string]) {
		const course = Agility.Courses.find(course =>
			course.aliases.some(alias => stringMatches(alias, courseName))
		);

		if (!course) return msg.send(`Thats not a valid agility course.`);

		const data: { id: string; lapCount: number }[] = await this.query(
			`SELECT id, "lapsScores"->>'${course.id}' as "lapCount" FROM users WHERE "lapsScores"->>'${course.id}' IS NOT NULL ORDER BY ("lapsScores"->>'${course.id}')::int DESC LIMIT 50;`
		);

		this.doMenu(
			msg,
			util
				.chunk(data, 10)
				.map(subList =>
					subList
						.map(({ id, lapCount }) => `**${this.getUsername(id)}:** ${lapCount} Laps`)
						.join('\n')
				),
			`${course.name} Laps Leaderboard`
		);
	}

	async creatures(msg: KlasaMessage, [creatureName = '']: [string]) {
		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias =>
					stringMatches(alias, creatureName) ||
					stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) return msg.send(`Thats not a valid creature.`);

		const data: { id: string; creatureCount: number }[] = await this.query(
			`SELECT id, "creatureScores"->>'${creature.id}' as "creatureCount" FROM users WHERE "creatureScores"->>'${creature.id}' IS NOT NULL ORDER BY ("creatureScores"->>'${creature.id}')::int DESC LIMIT 50;`
		);

		this.doMenu(
			msg,
			util
				.chunk(data, 10)
				.map(subList =>
					subList
						.map(
							({ id, creatureCount }) =>
								`**${this.getUsername(id)}:** ${creatureCount} caught`
						)
						.join('\n')
				),
			`Catch Leaderboard for ${creature.name}`
		);
	}

	async doMenu(msg: KlasaMessage, pages: string[], title: string) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));

		const display = new UserRichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of pages) {
			display.addPage(new MessageEmbed().setTitle(title).setDescription(page));
		}

		return display.start(loadingMsg as KlasaMessage, msg.author.id, {
			jump: false,
			stop: false
		});
	}
}
