const {
	Command,
	RichDisplay,
	util: { chunk }
} = require('klasa');
const { MessageEmbed } = require('discord.js');

const petData = require('../../../data/pets');
const { fmNum } = require('../../../config/util');
const badges = require('../../../config/badges');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords]',
			subcommands: true
		});

		this.resolveEntries = this.resolveEntries.bind(this);
	}

	async run(msg) {
		return this.gp(msg);
	}

	async resolveEntries(settingsEntry) {
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

	async fetchRawUserSettings() {
		return this.client.providers
			.get(this.client.options.providers.default)
			.db.table('users')
			.filter(user => user.hasFields('GP') || user.hasFields('pets'))
			.run();
	}

	async petrecords(msg) {
		const { petRecords } = this.client.settings;

		const { prefix } = msg.guild.settings;
		const embed = new MessageEmbed().setDescription(
			`These numbers show the lowest and highest records of pets from the \`${prefix}pet\` command.`
		);

		const columns = [];
		for (const pet of petData) {
			columns.push(
				`${pet.emoji} ${fmNum(petRecords.lowest[pet.id]) || '0'} - ${fmNum(
					petRecords.highest[pet.id]
				) || '?'}`
			);
		}

		for (const column of chunk(columns, 15)) {
			embed.addField('<:OSBot:601768469905801226> Lowest - Highest', column, true);
		}

		return msg.send(embed);
	}

	async gp(msg) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
		const rawUserSettings = await this.fetchRawUserSettings();

		const onlyForGuild = msg.flagArgs.server;

		const users = await Promise.all(
			rawUserSettings
				.filter(u => {
					if (!u.GP) return false;
					if (onlyForGuild && !msg.guild.members.has(u.id)) return false;
					return true;
				})
				.sort((a, b) => b.GP - a.GP)
				.slice(0, 300)
				.map(this.resolveEntries)
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle('GP Leaderboard')
					.setDescription(
						page
							.map(({ user, GP }) => `**${user}** has ${GP.toLocaleString()} GP `)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg, { jump: false, stop: false });
	}

	async pets(msg) {
		const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
		const rawUserSettings = await this.fetchRawUserSettings();

		const onlyForGuild = msg.flagArgs.server;

		const users = await Promise.all(
			rawUserSettings
				.filter(u => {
					if (!u.pets) return false;
					if (onlyForGuild && !msg.guild.members.has(u.id)) return false;
					return true;
				})
				.sort((a, b) => Object.keys(b.pets).length - Object.keys(a.pets).length)
				.slice(0, 300)
				.map(this.resolveEntries)
		);

		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const page of chunk(users, 10)) {
			display.addPage(
				new MessageEmbed()
					.setTitle('Pets Leaderboard')
					.setDescription(
						page
							.map(
								({ user, pets }) =>
									`**${user}** has ${Object.keys(pets).length} pets `
							)
							.join('\n')
					)
			);
		}

		return display.run(loadingMsg, { jump: false, stop: false });
	}
};
