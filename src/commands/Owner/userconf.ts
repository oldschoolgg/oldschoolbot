import { Command, CommandStore } from 'klasa';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: false
		});
	}
}
