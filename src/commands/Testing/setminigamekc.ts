import { CommandStore, KlasaMessage } from 'klasa';

import { Minigames, settingsUpdate } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str> <kc:int{0,5000}>',
			usageDelim: ' ',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [name, kc]: [string, number]) {
		const minigame = Minigames.find(m => stringMatches(m.column, name));
		if (!minigame) {
			return msg.channel.send(
				`That's not a valid minigame. The valid minigames are: ${Minigames.map(m => m.column).join(', ')}.`
			);
		}
		settingsUpdate('Minigame', msg.author.id, { [minigame.column]: kc });

		return msg.channel.send(`Set your ${minigame.name} kc to ${kc}.`);
	}
}
