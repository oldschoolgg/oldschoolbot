import { CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			guarded: true,
			permissionLevel: 10,
			enabled: false,
			categoryFlags: ['hidden']
		});
	}
}
