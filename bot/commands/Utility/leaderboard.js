const {
	Command,
	util: { chunk }
} = require('klasa');
const { MessageEmbed } = require('discord.js');

const petData = require('../../../data/pets');
const { fmNum } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords]'
		});

		this.resolveEntries = this.resolveEntries.bind(this);
	}

	async resolveEntries(settingsEntry) {
		const user = await this.client.users.fetch(settingsEntry.id);
		return {
			...settingsEntry,
			user: user ? user.username : 'Unknown'
		};
	}

	async run(msg, [board = 'gp']) {
		if (board === 'petrecords') {
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

		const rawUserSettings = await this.client.providers
			.get(this.client.options.providers.default)
			.db.table('users')
			.filter(user => user.hasFields('GP') || user.hasFields('pets'))
			.run();

		if (board === 'gp') {
			const users = await Promise.all(
				rawUserSettings
					.filter(u => u.GP)
					.sort((a, b) => b.GP - a.GP)
					.slice(0, 10)
					.map(this.resolveEntries)
			);

			const leaderboard = users.map(
				({ user, GP }) => `**${user}** has ${GP.toLocaleString()} GP `
			);

			return msg.send(leaderboard.join('\n') || 'Nobody has any GP!');
		}

		const users = await Promise.all(
			rawUserSettings
				.filter(u => u.pets)
				.sort((a, b) => Object.keys(b.pets).length - Object.keys(a.pets).length)
				.slice(0, 10)
				.map(this.resolveEntries)
		);

		const leaderboard = users.map(
			({ user, pets }) => `**${user}** has ${Object.keys(pets).length} pets `
		);

		return msg.send(leaderboard.join('\n') || 'Nobody has any pets!');
	}
};
