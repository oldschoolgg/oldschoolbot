const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the Clue Highscores of an account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const { Minigames } = await osrs.hiscores.getPlayer(username, 'Normal').catch(() => {
			throw this.client.notFound;
		});

		const clues = {
			beginner: Minigames.Clue_Scrolls_Beginner,
			easy: Minigames.Clue_Scrolls_Easy,
			medium: Minigames.Clue_Scrolls_Medium,
			hard: Minigames.Clue_Scrolls_Hard,
			elite: Minigames.Clue_Scrolls_Elite,
			master: Minigames.Clue_Scrolls_Master,
			overall: Minigames.Clue_Scrolls_All
		};

		for (const prop in clues) {
			clues[prop].rank = clues[prop].rank !== -1 ? clues[prop].rank.toLocaleString() : 0;

			clues[prop].score = clues[prop].score !== -1 ? clues[prop].score.toLocaleString() : 0;
		}

		const { beginner, easy, medium, hard, elite, master, overall } = clues;

		const embed = new MessageEmbed()
			.setAuthor(username)
			.setColor(52224)
			.setThumbnail('https://i.imgur.com/azW3cSB.png')
			.addField(
				'Beginner',
				`**Rank:** ${beginner.rank}\n**Score:** ${beginner.score}\n`,
				true
			)
			.addField('Easy', `**Rank:** ${easy.rank}\n**Score:** ${easy.score}\n`, true)
			.addField('Medium', `**Rank:** ${medium.rank}\n**Score:** ${medium.score}\n`, true)
			.addField('Hard', `**Rank:** ${hard.rank}\n**Score:** ${hard.score}\n`, true)
			.addField('Elite', `**Rank:** ${elite.rank}\n**Score:** ${elite.score}\n`, true)
			.addField('Master', `**Rank:** ${master.rank}\n**Score:** ${master.score}\n`, true)
			.addField('Overall', `**Rank:** ${overall.rank}\n**Score:** ${overall.score}\n`, true);

		return msg.send({ embed });
	}
};
