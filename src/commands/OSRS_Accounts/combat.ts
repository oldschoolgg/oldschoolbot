import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['cb'],
			description: 'Shows your Combat level.',
			usage: '(username:rsn)'
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);

			return msg.send(`${username}'s Combat Level is **${player.combatLevel}**.`);
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
