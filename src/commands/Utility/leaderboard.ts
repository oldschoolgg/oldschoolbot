import { MessageEmbed } from 'discord.js';
import { util, KlasaMessage, Command, KlasaClient, CommandStore, RichDisplay } from 'klasa';

import { fmNum } from '../../../config/util';
import { SettingsEntry } from '../../lib/types';
import { findMonster, stringMatches, noOp, notEmpty } from '../../lib/util';
import pets from '../../lib/pets';
import { collectionLogTypes } from '../../lib/collectionLog';
import { Time } from '../../lib/constants';

interface LeaderboardUser extends SettingsEntry {
	user: string;
	fetchedAt: number;
}

export default class extends Command {
	public settingEntryCache: SettingsEntry[] = [];
	public lastCacheUpdate = 0;
	public userCache: Map<string, LeaderboardUser> = new Map();

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords|kc|cl] [name:...string]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['lb']
		});

		this.resolveEntries = this.resolveEntries.bind(this);
	}

	async run(msg: KlasaMessage) {
		this.gp(msg);
		return null;
	}

	async resolveEntries(settingsEntry: SettingsEntry) {
		const cachedUser = this.userCache.get(settingsEntry.id);
		if (!cachedUser || Date.now() - cachedUser.fetchedAt < Time.Minute * 30) {
			const user = await this.client.users.fetch(settingsEntry.id).catch(noOp);

			const leaderBoardUser: LeaderboardUser = {
				...settingsEntry,
				fetchedAt: Date.now(),
				user: user ? `${user.badges} ${user.username}` : 'Unknown'
			};

			this.userCache.set(settingsEntry.id, leaderBoardUser);
		}

		return cachedUser;
	}

	async fetchRawUserSettings(): Promise<SettingsEntry[]> {
		if (
			this.settingEntryCache.length === 0 ||
			Date.now() - this.lastCacheUpdate < Time.Minute * 30
		) {
			const results = await (this.client.providers.get(
				this.client.options.providers.default as string
			) as any).db
				.table('users')
				.run();

			this.settingEntryCache = results;
			this.lastCacheUpdate = Date.now();
		}

		return this.settingEntryCache;
	}

	async petrecords(msg: KlasaMessage) {
		const petRecords = this.client.settings.get('petRecords');
		const embed = new MessageEmbed().setDescription(
			`These numbers show the lowest and highest records of pets from the \`${msg.cmdPrefix}pet\` command.`
		);

		const columns = [];
		for (const pet of pets) {
			columns.push(
				`${pet.emoji} ${fmNum(petRecords.lowest[pet.id]) || '0'} - ${fmNum(
					petRecords.highest[pet.id]
				) || '?'}`
			);
		}

		for (const column of util.chunk(columns, 15)) {
			embed.addField('<:OSBot:601768469905801226> Lowest - Highest', column, true);
		}

		return msg.send(embed);
	}

	async fetchUsers(filter: any, sort: any) {
		const rawUserSettings = await this.fetchRawUserSettings();

		const users = await Promise.all(
			rawUserSettings
				.filter(filter)
				.sort(sort)
				.slice(0, 300)
				.map(this.resolveEntries)
		);

		return users.filter(notEmpty);
	}

	async gp(msg: KlasaMessage) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));

		const onlyForGuild = msg.flagArgs.server;

		const users = await this.fetchUsers(
			(u: LeaderboardUser) => {
				if (!u.GP) return false;
				if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
				return true;
			},
			(a: LeaderboardUser, b: LeaderboardUser) => (b.GP ?? 0) - (a.GP ?? 0)
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of util.chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle('GP Leaderboard')
					.setDescription(
						page
							.map(
								({ user, GP }) =>
									`**${user}** has ${GP ? GP.toLocaleString() : 0} GP `
							)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg as KlasaMessage, { jump: false, stop: false });
	}

	async pets(msg: KlasaMessage) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));

		const onlyForGuild = msg.flagArgs.server;

		const users = await this.fetchUsers(
			(u: LeaderboardUser) => {
				if (!u.pets) return false;
				if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
				return true;
			},
			(a: LeaderboardUser, b: LeaderboardUser) =>
				(b.pets ? Object.keys(b.pets).length : 0) -
				(a.pets ? Object.keys(a.pets).length : 0)
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of util.chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle('Pets Leaderboard')
					.setDescription(
						page
							.map(
								({ user, pets }) =>
									`**${user}** has ${pets ? Object.keys(pets).length : 0} pets `
							)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg as KlasaMessage, { jump: false, stop: false });
	}

	async kc(msg: KlasaMessage, [name]: [string]) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
		if (!name)
			throw `Please specify which monster, for example \`${msg.cmdPrefix}leaderboard kc bandos\``;
		const monster = findMonster(name);
		if (!monster) throw `That's not a valid monster!`;

		const onlyForGuild = msg.flagArgs.server;

		const users = await this.fetchUsers(
			(u: LeaderboardUser) => {
				if (!u.monsterScores || !u.monsterScores[monster.id]) return false;
				if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
				return true;
			},
			(a: LeaderboardUser, b: LeaderboardUser) => {
				const aScore = a.monsterScores![monster.id] ?? 0;
				const bScore = b.monsterScores![monster.id] ?? 0;
				return bScore - aScore;
			}
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of util.chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle(`KC Leaderboard for ${monster.name}`)
					.setDescription(
						page
							.map(
								({ user, monsterScores }) =>
									`**${user}**: ${monsterScores![monster.id] ?? 0}`
							)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg as KlasaMessage, { jump: false, stop: false });
	}

	async cl(msg: KlasaMessage, [inputType = 'all']: [string]) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));

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

		const users = await this.fetchUsers(
			(u: LeaderboardUser) => {
				if (!u.collectionLogBank) return false;
				if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
				return true;
			},
			(a: LeaderboardUser, b: LeaderboardUser) => {
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
			}
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of util.chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle(`${type.name} Collection Log Leaderboard`)
					.setDescription(
						page
							.map(
								({ user, collectionLogBank = {} }) =>
									`**${user}**: ${
										Object.entries(collectionLogBank).filter(
											([itemID, qty]) =>
												qty > 0 && items.includes(parseInt(itemID))
										).length
									}`
							)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg as KlasaMessage, { jump: false, stop: false });
	}
}
