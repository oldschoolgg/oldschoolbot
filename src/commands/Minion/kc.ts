import { CommandStore, KlasaMessage } from 'klasa';

import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:string>',
			description: "Shows your minions' KC for monsters/bosses.",
			examples: ['+kc vorkath', '+kc bandos'],
			categoryFlags: ['minion', 'pvm']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage> {
		const [kcName, kcAmount] = await msg.author.getKCByName(name);

		if (!kcName) {
			return msg.send(`That's not a valid monster, minigame or hunting creature.`);
		}

		return msg.send(`Your ${kcName} KC is: ${kcAmount}.`);
	}
}
