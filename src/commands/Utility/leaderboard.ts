import { MessageEmbed } from 'discord.js';
import { util, KlasaMessage, Command, CommandStore, RichDisplay } from 'klasa';

import { SettingsEntry, StringKeyedBank } from '../../lib/types';
import badges from '../../lib/badges';
import { Time } from '../../lib/constants';
import { findMonster, stringMatches } from '../../lib/util';
import { collectionLogTypes } from '../../lib/collectionLog';

const CACHE_TIME = Time.Minute * 5;

interface GPUser {
	id: string;
	GP: number;
}

interface PetUser {
	id: string;
	petcount: number;
}

interface KCUser {
	id: string;
	monsterScores: StringKeyedBank;
}

interface CLUser {
	id: string;
	collectionLogBank: StringKeyedBank;
}

interface GPLeaderboard {
	lastUpdated: number;
	list: GPUser[];
}

interface PetLeaderboard {
	lastUpdated: number;
	list: PetUser[];
}

interface KCLeaderboard {
	lastUpdated: number;
	list: KCUser[];
}

interface CLLeaderboard {
	lastUpdated: number;
	list: CLUser[];
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

	public petLeaderboard: PetLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public kcLeaderboard: KCLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public clLeaderboard: CLLeaderboard = {
		lastUpdated: 0,
		list: []
	};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords|kc|cl] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['lb']
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
			this.usernameCache.map.set(
				user.id,
				`${user.badges.map(num => badges[num]).join(' ')} ${this.getUsername(user.id) ||
					'(Unknown)'}`
			);
		}
	}

	async run(msg: KlasaMessage) {
		this.gp(msg);
		return null;
	}

	async query(query: string, cacheUsernames = true) {
		console.log(`Querying: ${query}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const result = await this.client.providers.default!.runAll(query);
		if (cacheUsernames) this.cacheUsernames();
		return result;
	}

	async gp(msg: KlasaMessage) {
		const onlyForGuild = msg.flagArgs.server;

		if (Date.now() - this.gpLeaderboard.lastUpdated > CACHE_TIME) {
			this.gpLeaderboard.list = (
				await this.query(
					`SELECT "id", "GP" FROM users WHERE "GP" > 0 ORDER BY "GP" DESC LIMIT 2000;`
				)
			).map((res: any) => ({ ...res, GP: parseInt(res.GP) }));
			this.gpLeaderboard.lastUpdated = Date.now();
		}

		let { list } = this.gpLeaderboard;

		if (onlyForGuild && msg.guild) {
			list = list.filter((gpUser: GPUser) => msg.guild!.members.has(gpUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
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
			throw `Please specify which monster, for example \`${msg.cmdPrefix}leaderboard kc bandos\``;
		}
		const monster = findMonster(name);
		if (!monster) throw `That's not a valid monster!`;

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

	async cl(msg: KlasaMessage, [inputType = 'all']: [string]) {
		const type = collectionLogTypes.find(_type =>
			_type.aliases.some(name => stringMatches(name, inputType))
		);

		if (!type) {
			throw `That's not a valid collection log type. The valid types are: ${collectionLogTypes
				.map(type => type.name)
				.join(', ')}`;
		}

		const items = Object.values(type.items).flat(100);

		const onlyForGuild = msg.flagArgs.server;

		if (Date.now() - this.clLeaderboard.lastUpdated > CACHE_TIME) {
			this.clLeaderboard.list = await this.query(
				`SELECT id, "collectionLogBank" FROM users WHERE "collectionLogBank"::text <> '{}'::text;`
			);
			this.clLeaderboard.lastUpdated = Date.now();
		}

		let list = this.clLeaderboard.list
			.sort((a: CLUser, b: CLUser) => {
				const aScore = a.collectionLogBank
					? Object.entries(a.collectionLogBank).filter(
							([itemID, qty]) => qty > 0 && items.includes(parseInt(itemID))
					  ).length
					: -1;
				const bScore = b.collectionLogBank
					? Object.entries(b.collectionLogBank).filter(
							([itemID, qty]) => qty > 0 && items.includes(parseInt(itemID))
					  ).length
					: -1;
				return bScore - aScore;
			})
			.slice(0, 2000);

		if (onlyForGuild && msg.guild) {
			list = list.filter((kcUser: CLUser) => msg.guild!.members.has(kcUser.id));
		}

		this.doMenu(
			msg,
			util
				.chunk(list, 10)
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

	async doMenu(msg: KlasaMessage, pages: string[], title: string) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of pages) {
			display.addPage(new MessageEmbed().setTitle(title).setDescription(page));
		}

		return display.run(loadingMsg as KlasaMessage, {
			jump: false,
			stop: false
		});
	}
}
