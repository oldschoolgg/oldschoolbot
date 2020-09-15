import { Command, CommandStore, KlasaMessage } from 'klasa';

import { cleanMentions } from '../../lib/util';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		return msg.send(
			`${cleanMentions(msg.guild, name)} loves you ${Math.floor(Math.random() * 100) + 1}%!`
		);
	}
}
