import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { Monsters } from 'oldschooljs';

import badges from '../../lib/badges';
import { BotCommand } from '../../lib/BotCommand';
import { collectionLogTypes } from '../../lib/collectionLog';
import { Time } from '../../lib/constants';
import { Minigames } from '../../lib/minions/data/minigames';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { ItemBank, SettingsEntry } from '../../lib/types';
import { convertXPtoLVL, stringMatches, stripEmojis, toTitleCase } from '../../lib/util';
import { Workers } from '../../lib/workers';
import { CLUser } from '../../lib/workers/leaderboard.worker';
import PostgresProvider from '../../providers/postgres';

const CACHE_TIME = Time.Minute * 5;

interface SkillUser {
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
			usage: '[pets|gp|petrecords|kc|cl|qp|skills|sacrifice|laps|creatures] [name:...string]',
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

	getUsername(userID: string) {
		const username = this.usernameCache.map.get(userID);
		if (!username) return '(Unknown)';
		return username;
	}

	async cacheUsernames() {
		const arrayOfUsers: { badges: number[]; id: string }[] = await this.query(
			`SELECT "badges", "id" FROM users WHERE ARRAY_LENGTH(badges, 1) > 0;`,
			false
		);

		for (const user of this.client.users.values()) {
			this.usernameCache.map.set(user.id, user.username);
		}

		for (const user of arrayOfUsers) {
			const rawName = this.client.users.get(user.id)?.username ?? '(Unknown)';
			const rawBadges = user.badges.map(num => badges[num]).join(' ');
			this.usernameCache.map.set(user.id, `${rawBadges} ${stripEmojis(rawName)}`);
		}
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
				`SELECT "id", "sacrificedValue" FROM users WHERE "sacrificedValue" > 0 ORDER BY "sacrificedValue" DESC LIMIT 2000;`
			)
		).map((res: any) => ({ ...res, amount: parseInt(res.sacrificedValue) }));

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
			list = list.filter((qpUser: QPUser) => msg.guild!.members.has(qpUser.id));
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
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS(pets)) petcount, id FROM users
) u
ORDER BY u.petcount DESC LIMIT 2000;`
			);
			this.petLeaderboard.lastUpdated = Date.now();
		}

		let { list } = this.petLeaderboard;

		if (onlyForGuild && msg.guild) {
			list = list.filter((gpUser: PetUser) => msg.guild!.members.has(gpUser.id));
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

	async kc(msg: KlasaMessage, [name]: [string]) {
		if (!name) {
			return msg.send(
				`Please specify which monster, for example \`${msg.cmdPrefix}leaderboard kc bandos\``
			);
		}

		const monster = Monsters.find(
			mon =>
				stringMatches(mon.name, name) ||
				mon.aliases.some(alias => stringMatches(alias, name))
		);
		const minigame = Minigames.find(game => stringMatches(game.name, name));

		if (!monster && !minigame) {
			return msg.send(`That's not a valid monster or minigame!`);
		}

		let key: 'minigameScores' | 'monsterScores' = Boolean(minigame)
			? 'minigameScores'
			: 'monsterScores';
		let entityID = (minigame?.id ?? monster?.id)!.toString();
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

		if (msg.flagArgs.server && msg.guild) {
			list = list.filter((kcUser: KCUser) => msg.guild!.members.has(kcUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(user => `**${this.getUsername(user.id)}:** ${user[key][entityID]} KC`)
						.join('\n')
				),
			`KC Leaderboard for ${(monster ?? minigame)!.name}`
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
					.join(' + ')} as totalxp FROM users ORDER BY totalxp DESC LIMIT 500;`
			);
			overallUsers = res
				.map(user => {
					let totalLevel = 0;
					for (const skill of skillsVals) {
						totalLevel += convertXPtoLVL(
							Number(user[`skills.${skill.id}` as keyof SkillUser]) as any
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
			res = res.filter((user: SkillUser) => msg.guild!.members.has(user.id));
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
						)}:** ${skillXP.toLocaleString()} xp (${convertXPtoLVL(skillXP)})`;
					})
					.join('\n')
			),
			`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
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

		const result = (await this.query(
			`SELECT u.id, u."logBankLength", u."collectionLogBank" FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("collectionLogBank")) "logBankLength" , id, "collectionLogBank" FROM users
) u
WHERE u."logBankLength" > 300 ORDER BY u."logBankLength" DESC;`
		)) as CLUser[];
		const users = await Workers.leaderboard({
			type: 'cl',
			users: result,
			collectionLogInput: type
		});

		const items = Object.values(type.items).flat(Infinity);
		this.doMenu(
			msg,
			util
				.chunk(users, 10)
				.map(subList =>
					subList
						.map(
							({ id, collectionLogBank }) =>
								`**${this.getUsername(id)}:** ${
									Object.entries(collectionLogBank).filter(
										([itemID, qty]) =>
											qty > 0 && items.includes(parseInt(itemID))
									).length
								}`
						)
						.join('\n')
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
								`**${this.getUsername(id)}:** ${creatureCount} Catched`
						)
						.join('\n')
				),
			`Catch LeaderBoard for ${creature.name}`
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
