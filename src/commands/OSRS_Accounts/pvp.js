const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['bh'],
			description: 'Shows the BH & LMS scores of an account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const { minigames: pvp } = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		for (const prop in pvp) {
			pvp[prop].rank = pvp[prop].rank !== -1 ? pvp[prop].rank.toLocaleString() : 0;
			pvp[prop].score = pvp[prop].score !== -1 ? pvp[prop].score.toLocaleString() : 0;
		}

		const embed = new MessageEmbed()
			.setAuthor(username)
			.setColor(52224)
			.setThumbnail('https://i.imgur.com/8hPO17o.png')
			.addField(
				'<:BH_Hunter:365046748022046723> Bounty Hunter - Hunter',
				`**Rank:** ${pvp.bountyHunter.rank}\n**Score:** ${pvp.bountyHunter.score}`,
				true
			)
			.addField(
				'<:BH_Rogue:365046748495740928> Bounty Hunter - Rogue',
				`**Rank:** ${pvp.bountyHunterRogue.rank}\n**Score:** ${pvp.bountyHunterRogue.score}`,
				true
			)
			.addField(
				'<:LMS:365046749993107456> Last Man Standing',
				`**Rank:** ${pvp.LMS.rank}\n**Score:** ${pvp.LMS.score}`,
				true
			);
		return msg.send({ embed });
	}
};
