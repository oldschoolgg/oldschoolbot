import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import Skills from '../../lib/skilling/skills';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<skillName:string> <amount:int{1,200000000}>',
			usageDelim: ' '
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [skillName, newXP]: [string, number]) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}
		skillName = skillName.toLowerCase();
		if (Object.values(Skills).some(skill => skill.id === skillName)) {
			await msg.author.settings.update(`skills.${skillName}`, newXP);
			return msg.send(`${skillName} experience set to ${newXP}`);
		}
		return msg.send(`${skillName} is not a skill.`);
	}
}
