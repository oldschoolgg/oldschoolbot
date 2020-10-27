import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			description: 'Shows the ranks of an account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);
			const embed = this.getStatsEmbed(username, 7981338, player, 'rank', false);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
