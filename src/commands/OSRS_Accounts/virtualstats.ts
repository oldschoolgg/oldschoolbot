import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['vs'],
			description: 'Shows the virtual stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { virtualLevels: true });

			const embed = this.getStatsEmbed(username, 7981338, player, 'level', false);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
