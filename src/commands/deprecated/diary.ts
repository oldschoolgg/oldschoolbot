import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['d']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'This command has been removed, we recommend using the lookup in <https://oldschool.runescape.wiki/w/Achievement_Diary> instead!'
		);
	}
}
