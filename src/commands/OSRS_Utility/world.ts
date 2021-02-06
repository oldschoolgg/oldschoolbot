import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Worlds } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			oneAtTime: true,
			description: 'Returns information on a OSRS World.',
			examples: ['+world 1', '+world 301'],
			usage: '<world:int{1,1000}>',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [worldNumber]: [number]) {
		const world = await Worlds.fetch(worldNumber);
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
}
