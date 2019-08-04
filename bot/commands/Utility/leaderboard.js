const {
	Command,
	util: { chunk }
} = require('klasa');
const {
	util: { escapeMarkdown: esc }
} = require('discord.js');
const { MessageEmbed } = require('discord.js');

const pets = require('../../../data/pets');
const { fmNum } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets|gp|petrecords]'
		});
	}

	async run(msg, [board = 'gp']) {
		if (board === 'gp') {
			const users = this.client.users
				.filter(user => user.settings.get('GP') > 0)
				.sort((a, b) => b.settings.get('GP') - a.settings.get('GP'))
				.first(10);

			const leaderboard = users.map(
				({ username, settings }) =>
					`**${esc(username)}** has ${settings.get('GP').toLocaleString()} GP `
			);

			return msg.send(leaderboard.join('\n') || 'Nobody has any GP!');
		}

		if (board === 'petrecords') {
			const { petRecords } = this.client.settings;

			const { prefix } = msg.guild.settings;
			const embed = new MessageEmbed().setDescription(
				`These numbers show the lowest and highest records of pets from the \`${prefix}pet\` command.`
			);

			const columns = [];
			for (const pet of pets) {
				columns.push(
					`${pet.emoji} ${fmNum(petRecords.lowest[pet.id]) || '0'} - ${fmNum(
						petRecords.highest[pet.id]
					) || '0'}`
				);
			}

			for (const column of chunk(columns, 15)) {
				embed.addField('<:OSBot:601768469905801226> Lowest - Highest', column, true);
			}

			return msg.send(embed);
		}

		const users = this.client.users
			.filter(user => Object.keys(user.settings.get('pets')).length > 0)
			.sort(
				(a, b) =>
					Object.keys(b.settings.get('pets')).length -
					Object.keys(a.settings.get('pets')).length
			)
			.first(10);

		const leaderboard = users.map(
			({ username, settings }) =>
				`**${esc(username)}** has ${Object.keys(settings.get('pets')).length} pets `
		);

		return msg.send(leaderboard.join('\n') || 'Nobody has any pets!');
	}
};
