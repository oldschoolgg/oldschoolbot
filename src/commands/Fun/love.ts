import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		return msg.send(`${name} loves you ${Math.floor(Math.random() * 100) + 1}%!`);
	}
}
