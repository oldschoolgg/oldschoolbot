const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Returns information on a OSRS World.',
			usage: '<world:int>'
		});
	}

	async run(msg, [world]) {
		const worldSelector = `#slu-world-${world > 200 ? world : world + 300}`;
		const info = [];
		snekfetch.get('http://oldschool.runescape.com/slu').then(res => {
			const worlds = cheerio.load(res.text);
			worlds(worldSelector)
				.parent()
				.parent()
				.children()
				.each(function (i, elem) {
					info[i] = worlds(this).text();
				});
			info.shift();

			if (!info[0]) return msg.send("That's an invalid world!");

			const embed = new MessageEmbed()
				.setColor(7981338)
				.setThumbnail('https://i.imgur.com/56i6oyn.png')
				.setFooter(`Old School RuneScape World ${world}`, 'https://i.imgur.com/fVakfwp.png')
				.addField('Access', info[2], true)
				.addField('Location', info[1], true)
				.addField('Players', info[0].split(' ')[0], true)
				.addField('Activity', info[3], true);
			return msg.send({ embed });
		});
	}

};
