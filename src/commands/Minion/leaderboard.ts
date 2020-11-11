import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, util } from 'klasa';
import { Monsters } from 'oldschooljs';

import badges from '../../lib/badges';
import { collectionLogTypes } from '../../lib/collectionLog';
import { Time } from '../../lib/constants';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { ItemBank, SettingsEntry } from '../../lib/types';
import { convertXPtoLVL, stringMatches, stripEmojis, toTitleCase } from '../../lib/util';
import { Workers } from '../../lib/workers';
import { CLUser } from '../../lib/workers/leaderboard.worker';

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

interface KCLeaderboard {
	lastUpdated: number;
	list: KCUser[];
}

interface UsernameCache {
	lastUpdated: number;
	map: Map<string, string>;
}

export default class extends Command {
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

	public kcLeaderboard: KCLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords|kc|cl|qp|skills|sacrifice|laps] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['lb'],
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES']
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
		// @ts-ignore
		const result = await this.client.providers.default!.runAll(query);
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

		if (!monster) return msg.send(`That's not a valid monster!`);

		const onlyForGuild = msg.flagArgs.server;

		if (Date.now() - this.kcLeaderboard.lastUpdated > CACHE_TIME) {
			this.kcLeaderboard.list = (
				await this.query(
					`SELECT id, "monsterScores" FROM users WHERE "monsterScores"::text <> '{}'::text;`
				)
			).map((res: any) => ({ ...res, GP: parseInt(res.GP) }));
			this.kcLeaderboard.lastUpdated = Date.now();
		}

		let list = this.kcLeaderboard.list
			.filter(user => typeof user.monsterScores[monster.id] === 'number')
			.sort((a: KCUser, b: KCUser) => {
				const aScore = a.monsterScores![monster.id] ?? 0;
				const bScore = b.monsterScores![monster.id] ?? 0;
				return bScore - aScore;
			})
			.slice(0, 2000);

		if (onlyForGuild && msg.guild) {
			list = list.filter((kcUser: KCUser) => msg.guild!.members.has(kcUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
				.map(subList =>
					subList
						.map(
							({ id, monsterScores }) =>
								`**${this.getUsername(id)}:** ${monsterScores[monster.id]} KC`
						)
						.join('\n')
				),
			`KC Leaderboard for ${monster.name}`
		);
	}

	async skills(msg: KlasaMessage, [inputSkill = 'overall']: [string]) {
		let res: SkillUser[] = [];
		const skill = Object.values(Skills).find(_skill =>
			_skill.aliases.some(name => stringMatches(name, inputSkill))
		);

		if (inputSkill === 'overall') {
			res = await this.query(
				`SELECT id, "skills.cooking" + "skills.woodcutting" + "skills.mining" + "skills.smithing" + "skills.agility" + "skills.fishing" + "skills.firemaking" + "skills.runecraft" + "skills.crafting" + "skills.prayer" + "skills.fletching" as totalxp FROM users ORDER BY totalxp DESC LIMIT 2000;`
			);
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

		this.doMenu(
			msg,
			util.chunk(res, 10).map(subList =>
				subList
					.map((obj: SkillUser) => {
						const objKey = inputSkill === 'overall' ? 'totalxp' : `skills.${skill?.id}`;

						// @ts-ignore
						const skillXP = obj[objKey] ?? 0;
						const skillLVL =
							inputSkill === 'overall' ? '' : `(${convertXPtoLVL(skillXP)})`;

						return `**${this.getUsername(
							obj.id
						)}:** ${skillXP.toLocaleString()} xp ${skillLVL}`;
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
