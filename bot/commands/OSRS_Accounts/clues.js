const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');
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
		const { clues } = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		const embed = new MessageEmbed()
			.setAuthor(username)
			.setColor(52224)
			.setThumbnail('https://i.imgur.com/azW3cSB.png');

		for (const tier of Object.keys(clues)) {
			embed.addField(
				toTitleCase(tier),
				msg.language.get('CLUE_SCORE_FORMAT', clues[tier].rank, clues[tier].score),
				true
			);
		}

		return msg.send({ embed });
	}
};
