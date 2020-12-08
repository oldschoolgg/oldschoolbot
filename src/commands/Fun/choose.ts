import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { cleanMentions, randomItemFromArray } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<options:...str>',
			usageDelim: ',',
			description: 'Allows you to get the bot to make a choice from a list of options.',
			examples: [
				'+choose guthix, saradomin, zamorak, armadyl',
				'+choose do the inferno, get a pet'
			],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [choices]: [string]) {
		return msg.send(
			`I choose... **${cleanMentions(msg.guild, randomItemFromArray(choices.split(',')))}**.`
		);
	}
}
