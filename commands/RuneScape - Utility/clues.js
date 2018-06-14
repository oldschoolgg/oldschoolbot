const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the Clue Highscores of an account.',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const { Minigames } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(player => player)
			.catch(() => { throw this.client.notFound; });

		const clues = {
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

		const embed = new MessageEmbed()
			.setAuthor(username)
			.setColor(52224)
			.setThumbnail('https://i.imgur.com/azW3cSB.png')
			.addField('Easy', `**Rank:** ${clues.easy.rank}\n**Score:** ${clues.easy.score}\n`, true)
			.addField('Medium', `**Rank:** ${clues.medium.rank}\n**Score:** ${clues.medium.score}\n`, true)
			.addField('Hard', `**Rank:** ${clues.hard.rank}\n**Score:** ${clues.hard.score}\n`, true)
			.addField('Elite', `**Rank:** ${clues.elite.rank}\n**Score:** ${clues.elite.score}\n`, true)
			.addField('Master', `**Rank:** ${clues.master.rank}\n**Score:** ${clues.master.score}\n`, true)
			.addField('Overall', `**Rank:** ${clues.overall.rank}\n**Score:** ${clues.overall.score}\n`, true);

		return msg.send({ embed });
	}

};
