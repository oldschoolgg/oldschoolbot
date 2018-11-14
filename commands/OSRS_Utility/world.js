const { Command } = require('klasa');
const fetch = require('node-fetch');
const { parseTable } = require('../../resources/util');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Returns information on a OSRS World.',
			usage: '<world:int>',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [worldNumber]) {
		const worlds = await fetch('http://oldschool.runescape.com/slu')
			.then(res => res.text())
			.then(parseTable);

		const world = worlds.find(__world => {
			const _world = parseInt(__world.name.replace(/\D/g, ''));
			return _world === worldNumber || _world + 300 === worldNumber;
		});

		world.number = world.name.replace(/\D/g, '');

		if (!world) return msg.send("That's an invalid world!");

		const embed = new MessageEmbed()
			.setColor(7981338)
			.setThumbnail('https://i.imgur.com/56i6oyn.png')
			.setFooter(`Old School RuneScape World ${world.number}`, 'https://i.imgur.com/fVakfwp.png')
			.addField('Access', world.type, true)
			.addField('Location', world.country, true)
			.addField('Players', world.players, true)
			.addField('Activity', world.activity, true);

		return msg.send({ embed });
	}

};
