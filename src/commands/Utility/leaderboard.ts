import { MessageEmbed } from 'discord.js';
import { util, KlasaMessage, Command, KlasaClient, CommandStore, RichDisplay } from 'klasa';

import { fmNum } from '../../../config/util';
import { SettingsEntry } from '../../lib/types';
import badges from '../../lib/badges';
import { findMonster } from '../../lib/util';

export default class extends Command {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords|kc] [name:string]',
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
		const user = await this.client.users.fetch(settingsEntry.id);
		let userBadges = '';
		if (settingsEntry.badges && settingsEntry.badges.length > 0) {
			userBadges = settingsEntry.badges.map(badge => badges[badge]).join(' ');
		}
		return {
			...settingsEntry,
			user: user ? `${userBadges} ${user.username}` : 'Unknown'
		};
	}

	async fetchRawUserSettings(fieldsToHave: string[]): Promise<SettingsEntry[]> {
		return (this.client.providers
			.get(this.client.options.providers.default as string) as any)
			.db.table('users')
			.filter((user: any) => fieldsToHave.some(key => user.hasFields(key)))
			.run();
	}

	async petrecords(msg: KlasaMessage) {
		const petRecords = this.client.settings.get('petRecords');
		const embed = new MessageEmbed().setDescription(
			`These numbers show the lowest and highest records of pets from the \`${msg.cmdPrefix}pet\` command.`
		);

		const columns = [];
		for (const pet of petRecords) {
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

	async gp(msg: KlasaMessage) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
		const rawUserSettings = await this.fetchRawUserSettings(['GP', 'pets']);

		const onlyForGuild = msg.flagArgs.server;

		const users = await Promise.all(
			rawUserSettings
				.filter(u => {
					if (!u.GP) return false;
					if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
					return true;
				})
				.sort((a, b) => b.GP ?? 0 - (a.GP ?? 0))
				.slice(0, 300)
				.map(this.resolveEntries)
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
		const rawUserSettings = await this.fetchRawUserSettings(['GP', 'pets']);

		const onlyForGuild = msg.flagArgs.server;

		const users = await Promise.all(
			rawUserSettings
				.filter(u => {
					if (!u.pets) return false;
					if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
					return true;
				})
				.sort(
					(a, b) =>
						(b.pets ? Object.keys(b.pets).length : 0) -
						(a.pets ? Object.keys(a.pets).length : 0)
				)
				.slice(0, 300)
				.map(this.resolveEntries)
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
		const monster = findMonster(name);
		if (!monster) throw `That's not a valid monster!`;

		const rawUserSettings = await this.fetchRawUserSettings(['monsterScores']);
		const onlyForGuild = msg.flagArgs.server;

		const users = await Promise.all(
			rawUserSettings
				.filter(u => {
					if (!u.monsterScores) return false;
					if (onlyForGuild && msg.guild && !msg.guild.members.has(u.id)) return false;
					return true;
				})
				.sort(
					(a, b) => {
						const aScore = a.monsterScores![monster.id] ?? 0;
						const bScore = b.monsterScores![monster.id] ?? 0;
						return bScore - aScore;
				})
				.slice(0, 300)
				.map(this.resolveEntries)
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
}
