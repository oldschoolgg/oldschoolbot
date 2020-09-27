import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Minigames } from '../../lib/minions/data/minigames';
import { requiresMinion } from '../../lib/minions/decorators';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:string>'
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage> {
		const mon = Monsters.find(
			mon =>
				stringMatches(mon.name, name) ||
				mon.aliases.some(alias => stringMatches(alias, name))
		);
		const minigame = Minigames.find(game => stringMatches(game.name, name));

		if (!mon && !minigame) {
			throw `That's not a valid monster or minigame.`;
		}

		const kc = minigame ? msg.author.getMinigameScore(minigame.id) : msg.author.getKC(mon!);
		return msg.send(`Your ${minigame ? minigame.name : mon!.name} KC is: ${kc}.`);
	}
}
