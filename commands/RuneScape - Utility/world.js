const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Returns information on a OSRS World.',
			usage: '<worldNumber:int>'
		});
	}

	async run(msg, [worldNumber]) {
		if (!(worldNumber > 0 && worldNumber < 95) || (worldNumber < 113 && worldNumber > 99)) return msg.send('Invalid world number.');

		worldNumber += 300;
		const worldSelector = `#slu-world-${worldNumber}`;

		const info = [];
		snekfetch.get('http://oldschool.runescape.com/slu').then(r => {
			const $ = cheerio.load(r.text);
			const i = $(worldSelector)
				.parent()
				.parent()
				.children()
				.each(function (i, elem) {
					info[i] = $(this).text();
				});
			info.shift();
			const embed = new MessageEmbed()
				.setColor(7981338)
				.setThumbnail('https://i.imgur.com/56i6oyn.png')
				.setFooter(`Old School RuneScape World ${worldNumber}`, 'https://i.imgur.com/fVakfwp.png')
				.addField('Access', info[2], true)
				.addField('Location', info[1], true)
				.addField('Players', info[0].split(' ')[0], true)
				.addField('Activity', info[3], true);
			return msg.send({ embed });
		});
	}

};
