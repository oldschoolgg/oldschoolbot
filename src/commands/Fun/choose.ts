import { Command, CommandStore, KlasaMessage } from 'klasa';

import { cleanMentions, randomItemFromArray } from '../../lib/util';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<options:...str>',
			usageDelim: ','
		});
	}

	async run(msg: KlasaMessage, [choices]: [string]) {
		return msg.send(
			`I choose... **${cleanMentions(msg.guild, randomItemFromArray(choices.split(',')))}**.`
		);
	}
}
