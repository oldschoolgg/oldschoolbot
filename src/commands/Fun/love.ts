import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanMentions } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str>',
			description: 'Shows a love rating.',
			examples: ['+love Mod Sween', '+love @Woox'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		return msg.send(
			`${cleanMentions(msg.guild, name)} loves you ${Math.floor(Math.random() * 100) + 1}%!`
		);
	}
}
