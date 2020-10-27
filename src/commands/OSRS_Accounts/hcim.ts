import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['hc'],
			description: 'Shows the stats of a HCIM account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Hardcore });
			const embed = this.getStatsEmbed(username, 11995146, player);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
