import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { SkillsEnum } from '../../lib/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.update(SkillsEnum.Attack, 13034431);
		await msg.author.settings.update(SkillsEnum.Strength, 13034431);
		await msg.author.settings.update(SkillsEnum.Defence, 13034431);
		await msg.author.settings.update(SkillsEnum.Hitpoints, 13034431);
		await msg.author.settings.update(SkillsEnum.Prayer, 13034431);
		await msg.author.settings.update(SkillsEnum.Range, 13034431);
		await msg.author.settings.update(SkillsEnum.Magic, 13034431);
		await msg.author.settings.update(SkillsEnum.Slayer, 110000);
		await msg.author.addQP(275);
		return msg.send(
			`Your combat level is now 126 and your slayer level is 50. You also have 275qp`
		);
	}
}
