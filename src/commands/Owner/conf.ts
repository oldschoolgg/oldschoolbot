import { Command, CommandStore } from 'klasa';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			guarded: true,
			permissionLevel: 10,
			enabled: false
		});
	}
}
