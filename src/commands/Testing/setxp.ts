import { CommandStore, KlasaMessage } from 'klasa';

import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<skillName:string> <amount:int{1,200000000}>',
			usageDelim: ' ',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [skillName, newXP]: [string, number]) {
		skillName = skillName.toLowerCase();
		if (Object.values(Skills).some(skill => skill.id === skillName)) {
			await msg.author.settings.update(`skills.${skillName}`, newXP);
			return msg.send(`${skillName} experience set to ${newXP}`);
		}
		return msg.send(`${skillName} is not a skill.`);
	}
}
