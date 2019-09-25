const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');
const { toTitleCase } = require('../../../config/util');

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

		const embed = new MessageEmbed()
			.setAuthor(username)
			.setColor(52224)
			.setThumbnail('https://i.imgur.com/azW3cSB.png');

		for (const tier of Object.keys(clues)) {
			console.log([clues[tier].rank, clues[tier].score]);
			embed.addField(
				toTitleCase(tier),
				msg.language.get('CLUE_SCORE_FORMAT', clues[tier].rank, clues[tier].score),
				true
			);
		}

		return msg.send({ embed });
	}
};
