const { Command } = require('klasa');
const { Worlds } = require('oldschooljs');
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
		const world = await Worlds.fetch(worldNumber);
		console.log(world);
		if (!world) return msg.send("That's an invalid world!");

		const embed = new MessageEmbed()
			.setColor(7981338)
			.setThumbnail('https://i.imgur.com/56i6oyn.png')
			.setFooter(
				`Old School RuneScape World ${world.number}`,
				'https://i.imgur.com/fVakfwp.png'
			)
			.addField('Access', world.members ? 'Members' : 'Free to Play', true)
			.addField('Location', world.location, true)
			.addField('Players', world.players, true)
			.addField('Activity', world.activity, true);

		return msg.send({ embed });
	}
};
