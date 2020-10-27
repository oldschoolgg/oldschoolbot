import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['league', 'leagues'],
			description: 'Shows the stats of a Seasonal leagues account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Seasonal });
			const embed = this.getStatsEmbed(username, 7981338, player);
			embed.setFooter(`Twisted League`);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
