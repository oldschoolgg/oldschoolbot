import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { SkillsEnum } from '../../lib/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<quantity:int{1}>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity]: [number]) {
		await msg.author.settings.update(SkillsEnum.Slayer, quantity);
		return msg.send(`Your slayer level is ${msg.author.skillLevel(SkillsEnum.Slayer)}`);
	}
}
